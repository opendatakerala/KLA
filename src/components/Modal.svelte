<script>
  import { _, currentLang, isLoading } from '../lib/i18n.js';
  import { selectedConstituency, closeModal } from '../stores/constituencyStore.js';
  import { ldfCandidates, udfCandidates, ndaCandidates, othersCandidates, getCandidateName, getConstituencyName } from '../stores/candidateStore.js';
  import { historicalDataStore } from '../stores/historicalStore.js';
  import NiyamasabhaChart from './charts/NiyamasabhaChart.svelte';
  import LoksabhaChart from './charts/LoksabhaChart.svelte';

  const ALLIANCE_COLORS = {
    LDF: '#D94040',
    UDF: '#1565C0',
    NDA: '#E07828',
    Others: '#33AA55'
  };

  let currentModal = $derived($selectedConstituency);
  let currentLangValue = $derived($currentLang);
  let currentIsLoading = $derived($isLoading);
  
  let ldf = $derived($ldfCandidates);
  let udf = $derived($udfCandidates);
  let nda = $derived($ndaCandidates);
  let others = $derived($othersCandidates);

  function t(key) {
    return currentIsLoading ? key : $_(key);
  }

  let loksabhaVisible = $state(false);

  let historicalData = $derived($historicalDataStore);
  let niyamasabhaData = $derived(historicalData?.data?.niyamasabha || []);
  let loksabhaData = $derived(historicalData?.data?.loksabha || []);
  let historicalLoading = $derived(historicalData?.loading || false);
  let historicalError = $derived(historicalData?.error ? true : false);

  function handleClose() { closeModal(); }

  function handleKeydown(e) {
    if (e.key === 'Escape') handleClose();
  }

  function formatIndian(num) {
    if (!num) return '0';
    const n = parseInt(num, 10);
    return isNaN(n) ? '0' : n.toLocaleString('en-IN');
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
        <div class="modal-title">{getConstituencyName(currentModal, currentLangValue)}</div>
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

      {#if currentModal.pollingBooths || currentModal.votersTotal}
        <div class="constituency-stats">
          {#if currentModal.pollingBooths}
            <div class="stat-card">
              <span class="stat-label">{$_('modal.pollingBooths')}</span>
              <span class="stat-value">{formatIndian(currentModal.pollingBooths)}</span>
            </div>
          {/if}
          {#if currentModal.votersTotal}
            <div class="stat-card">
              <span class="stat-label">{$_('modal.voters')}</span>
              <span class="stat-value">{formatIndian(currentModal.votersTotal)}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">{$_('modal.genderBreakup')}</span>
              <div class="stat-breakdown">
                <span>♂ {formatIndian(currentModal.votersMale || 0)}</span>
                <span>♀ {formatIndian(currentModal.votersFemale || 0)}</span>
                {#if currentModal.votersTransgender > 0}
                  <span>⚥ {formatIndian(currentModal.votersTransgender)}</span>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <div class="modal-body">
        <div class="modal-section-label">
          {$_('modal.contestingCandidates')}
        </div>

        {#if ldf.length > 0}
          <div class="candidate-group">
            {#each ldf as c}
              <div class="candidate-row">
                <div class="alliance-bar" style="background: {ALLIANCE_COLORS.LDF}"></div>
                <div class="candidate-info">
                  <div class="alliance-label">LDF</div>
                  <div class="candidate-party">{c.party || '—'}</div>
                  <div class="candidate-name" class:tbd={!c.name}>{getCandidateName(c, currentLangValue, currentIsLoading, t)}</div>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if udf.length > 0}
          <div class="candidate-group">
            {#each udf as c}
              <div class="candidate-row">
                <div class="alliance-bar" style="background: {ALLIANCE_COLORS.UDF}"></div>
                <div class="candidate-info">
                  <div class="alliance-label">UDF</div>
                  <div class="candidate-party">{c.party || '—'}</div>
                  <div class="candidate-name" class:tbd={!c.name}>{getCandidateName(c, currentLangValue, currentIsLoading, t)}</div>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if nda.length > 0}
          <div class="candidate-group">
            {#each nda as c}
              <div class="candidate-row">
                <div class="alliance-bar" style="background: {ALLIANCE_COLORS.NDA}"></div>
                <div class="candidate-info">
                  <div class="alliance-label">NDA</div>
                  <div class="candidate-party">{c.party || '—'}</div>
                  <div class="candidate-name" class:tbd={!c.name}>{getCandidateName(c, currentLangValue, currentIsLoading, t)}</div>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if others.length > 0}
          <div class="candidate-group">
            {#each others as c}
              <div class="candidate-row">
                <div class="alliance-bar" style="background: {ALLIANCE_COLORS.Others}"></div>
                <div class="candidate-info">
                  <div class="alliance-label">Others</div>
                  <div class="candidate-party">{c.party || '—'}</div>
                  <div class="candidate-name" class:tbd={!c.name}>{getCandidateName(c, currentLangValue, currentIsLoading, t)}</div>
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
    font-size: var(--fs-sm);
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  .modal-title {
    font-family: 'Inter', sans-serif;
    font-size: var(--fs-2xl);
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
    font-size: var(--fs-sm);
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
    font-size: var(--fs-sm);
    cursor: pointer;
    transition: all 0.15s;
  }

  .modal-close:hover {
    background: var(--bg2);
    color: var(--text);
  }

  .constituency-stats {
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 14px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    min-width: 80px;
  }

  .stat-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.08em;
    color: var(--muted);
    text-transform: uppercase;
  }

  .stat-value {
    font-family: 'DM Mono', monospace;
    font-size: var(--fs-base);
    font-weight: 700;
    color: var(--text);
  }

  .stat-breakdown {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-family: 'DM Mono', monospace;
    font-size: var(--fs-xs);
    color: var(--muted);
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
