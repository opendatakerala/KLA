<script>
  import { _ } from '../lib/i18n.js';
  import { selectedConstituency, closeModal } from '../stores/constituencyStore.js';
  import NiyamasabhaChart from './charts/NiyamasabhaChart.svelte';
  import LoksabhaChart from './charts/LoksabhaChart.svelte';

  const ALLIANCE_COLORS = {
    LDF: '#D94040',
    UDF: '#1565C0',
    NDA: '#E07828',
    Others: '#33AA55'
  };

  const API_BASE = import.meta.env.PUBLIC_KLA_API_URL || '';
  let currentModal = $derived($selectedConstituency);
  
  let ldfCandidates = $derived(currentModal?.candidates?.filter(c => c.alliance === 'LDF') || []);
  let udfCandidates = $derived(currentModal?.candidates?.filter(c => c.alliance === 'UDF') || []);
  let ndaCandidates = $derived(currentModal?.candidates?.filter(c => c.alliance === 'NDA') || []);
  let othersCandidates = $derived(currentModal?.candidates?.filter(c => c.alliance === 'Others' || !['LDF', 'UDF', 'NDA'].includes(c.alliance)) || []);

  let historicalLoading = $state(true);
  let historicalError = $state(false);
  let niyamasabhaData = $state([]);
  let loksabhaData = $state([]);
  let loksabhaVisible = $state(false);

  $effect(() => {
    // Svelte automatically tracks this as a dependency.
    // The effect will ONLY re-run when currentModal.qid changes.
    const qid = currentModal?.qid;

    if (!qid) {
      niyamasabhaData = [];
      loksabhaData = [];
      historicalLoading = false;
      return;
    }

    // Use an AbortController to cancel previous requests if the qid changes 
    // before the previous fetch completes.
    const controller = new AbortController();

    async function fetchHistoricalData() {
      historicalLoading = true;
      historicalError = false;

      try {
        const res = await fetch(`${API_BASE}/api/kla2026/${qid}.json`, {
          signal: controller.signal
        });
        const data = await res.json();
        niyamasabhaData = data.niyamasabha || [];
        loksabhaData = data.loksabha || [];
      } catch (e) {
        // Ignore errors caused by our own abort cancellation
        if (e.name === 'AbortError') return; 
        
        console.error('Failed to fetch historical data:', e);
        historicalError = true;
      } finally {
        historicalLoading = false;
      }
    }

    fetchHistoricalData();

    // The cleanup function runs right before the effect re-runs, 
    // or when the component unmounts.
    return () => {
      controller.abort();
    };
  });

  function handleClose() { closeModal(); }

  function handleKeydown(e) {
    if (e.key === 'Escape') handleClose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if currentModal}
  <div
    class="modal-overlay open"
    onclick={handleClose}
    role="button"
    tabindex="0"
  >
    <div
      class="modal"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
    >
      <div class="modal-top"></div>
      <div class="modal-header">
        <div class="modal-eyebrow">
          {currentModal.district} · Constituency #{currentModal.number}
        </div>
        <div class="modal-title">{currentModal.name}</div>
        <div class="modal-badges">
          {#if currentModal.reservation}
            <span class="reservation-badge {currentModal.reservation.toLowerCase()}">
              {currentModal.reservation}
              <span>{$_('modal.reserved')}</span>
            </span>
          {/if}
        </div>
        <button class="modal-close" onclick={handleClose}>
          <span>{$_('modal.close')}</span>
        </button>
      </div>

      <div class="modal-body">
        <div class="modal-section-label">
          {$_('modal.contestingCandidates')}
        </div>

        {#if ldfCandidates.length > 0}
          <div class="candidate-group">
            {#each ldfCandidates as c}
              <div class="candidate-row">
                <div class="alliance-bar" style="background: {ALLIANCE_COLORS.LDF}"></div>
                <div class="candidate-info">
                  <div class="alliance-label">LDF</div>
                  <div class="candidate-party">{c.party || '—'}</div>
                  <div class="candidate-name" class:tbd={!c.name}>{c.name || 'To be announced'}</div>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if udfCandidates.length > 0}
          <div class="candidate-group">
            {#each udfCandidates as c}
              <div class="candidate-row">
                <div class="alliance-bar" style="background: {ALLIANCE_COLORS.UDF}"></div>
                <div class="candidate-info">
                  <div class="alliance-label">UDF</div>
                  <div class="candidate-party">{c.party || '—'}</div>
                  <div class="candidate-name" class:tbd={!c.name}>{c.name || 'To be announced'}</div>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if ndaCandidates.length > 0}
          <div class="candidate-group">
            {#each ndaCandidates as c}
              <div class="candidate-row">
                <div class="alliance-bar" style="background: {ALLIANCE_COLORS.NDA}"></div>
                <div class="candidate-info">
                  <div class="alliance-label">NDA</div>
                  <div class="candidate-party">{c.party || '—'}</div>
                  <div class="candidate-name" class:tbd={!c.name}>{c.name || 'To be announced'}</div>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if othersCandidates.length > 0}
          <div class="candidate-group">
            {#each othersCandidates as c}
              <div class="candidate-row">
                <div class="alliance-bar" style="background: {ALLIANCE_COLORS.Others}"></div>
                <div class="candidate-info">
                  <div class="alliance-label">Others</div>
                  <div class="candidate-party">{c.party || '—'}</div>
                  <div class="candidate-name" class:tbd={!c.name}>{c.name || 'To be announced'}</div>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Niyamasabha Historical Results -->
        <div class="modal-section-label">
          {$_('modal.historicalResultsNiyamasabha')}
        </div>
        <NiyamasabhaChart constituencyNumber={currentModal.number} data={niyamasabhaData} loading={historicalLoading} error={historicalError} />

        <!-- Lok Sabha Historical Results -->
        {#if currentModal.qid}
          <div class="modal-section-label loksabha-section">
            <button class="toggle-loksabha-btn" onclick={() => loksabhaVisible = !loksabhaVisible}>
              {loksabhaVisible ? '▼' : '▶'} {$_('modal.historicalResultsLoksabha')}
            </button>
          </div>
          <div class="loksabha-chart-wrapper" class:hidden={!loksabhaVisible}>
            <LoksabhaChart data={loksabhaData} loading={historicalLoading} error={historicalError} />
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-overlay:not(.open) { display: none; }

  .modal {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }

  .modal-top {
    height: 4px;
    background: linear-gradient(90deg, var(--ldf), var(--udf), var(--nda));
    border-radius: 12px 12px 0 0;
  }

  .modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    position: relative;
  }

  .modal-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  .modal-title {
    font-family: 'Inter', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--text);
    margin-top: 4px;
  }

  .modal-badges {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .reservation-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 4px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.05em;
  }

  .reservation-badge.sc {
    background: var(--sc-bg);
    color: var(--sc-color);
  }

  .reservation-badge.st {
    background: var(--st-bg);
    color: var(--st-color);
  }

  .modal-close {
    position: absolute;
    top: 16px; right: 16px;
    padding: 6px 12px;
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .modal-close:hover {
    background: var(--bg2);
    color: var(--text);
  }

  .modal-body { padding: 20px; }

  .modal-section-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 12px;
    margin-top: 24px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .modal-section-label:first-child { margin-top: 0; }

  .loksabha-section {
    border-bottom: none;
    padding-bottom: 0;
  }

  .loksabha-chart-wrapper.hidden {
    display: none;
  }

  .toggle-loksabha-btn {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-align: left;
  }

  .toggle-loksabha-btn:hover {
    color: var(--text);
  }

  .candidate-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    margin-bottom: 12px;
  }

  .candidate-row {
    display: flex;
    background: var(--card2);
    border-radius: 8px;
    overflow: hidden;
    min-height: 70px;
  }

  .alliance-bar {
    width: 4px;
    height: 60px;
    flex-shrink: 0;
  }

  .candidate-info {
    padding: 10px 12px;
    flex: 1;
    flex-shrink: 0;
  }

  .alliance-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    opacity: 0.7;
  }

  .candidate-party {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 14px;
    margin-top: 2px;
    color: #000;
  }

  .candidate-name {
    font-size: 12px;
    color: var(--text-soft);
    margin-top: 2px;
  }

  .candidate-name.tbd {
    color: var(--muted);
    font-style: italic;
  }
</style>
