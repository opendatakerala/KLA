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
          {currentLangValue === 'ml' && currentModal.districtMalayalam ? currentModal.districtMalayalam : currentModal.district} · {$_('modal.constituency')} #{currentModal.number}
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
            {@const total = parseInt(currentModal.votersTotal) || 0}
            {@const male = parseInt(currentModal.votersMale) || 0}
            {@const female = parseInt(currentModal.votersFemale) || 0}
            {@const trans = parseInt(currentModal.votersTransgender) || 0}
            {@const malePct = total > 0 ? Math.round((male / total) * 100) : 0}
            {@const femalePct = total > 0 ? Math.round((female / total) * 100) : 0}
            {@const transPct = total > 0 ? Math.round((trans / total) * 100) : 0}
            <div class="voters-card">
              <div class="voters-total">
                <span class="stat-label">{$_('modal.voters')}</span>
                <span class="voters-count">{formatIndian(currentModal.votersTotal)}</span>
              </div>
              <div class="voters-bar-wrapper">
                {#if trans > 0}
                  <div class="voters-bar-segment trans" style="width: {transPct}%"></div>
                {/if}
                <div class="voters-bar-segment female" style="width: {femalePct}%"></div>
                <div class="voters-bar-segment male" style="width: {malePct}%"></div>
              </div>
              <div class="voters-legend">
                <span class="legend-item"><span class="legend-dot female"></span> ♀ {formatIndian(female)} ({femalePct}%)</span>
                {#if trans > 0}
                  <span class="legend-item"><span class="legend-dot trans"></span> ⚥ {formatIndian(trans)} ({transPct}%)</span>
                {/if}
                <span class="legend-item"><span class="legend-dot male"></span> ♂ {formatIndian(male)} ({malePct}%)</span>
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
                    <div class="candidate-name" class:tbd={!c.name}>{getCandidateName(c, currentLangValue, currentIsLoading, t)}</div>
                    <div class="candidate-party">{c.party || '—'}</div>
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
                  <div class="candidate-name" class:tbd={!c.name}>{getCandidateName(c, currentLangValue, currentIsLoading, t)}</div>
                  <div class="candidate-party">{c.party || '—'}</div>
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
                  <div class="candidate-name" class:tbd={!c.name}>{getCandidateName(c, currentLangValue, currentIsLoading, t)}</div>
                  <div class="candidate-party">{c.party || '—'}</div>
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
                  <div class="candidate-name" class:tbd={!c.name}>{getCandidateName(c, currentLangValue, currentIsLoading, t)}</div>
                  <div class="candidate-party">{c.party || '—'}</div>
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
        {#if currentModal.qid && loksabhaData?.[0]?.parliamentaryConstituency}
          <div class="modal-section-label loksabha-section">
            <button class="toggle-loksabha-btn" onclick={() => loksabhaVisible = !loksabhaVisible}>
              {loksabhaVisible ? '▼' : '▶'} {$_('modal.partOfParliamentaryConstituency', { values: { parliamentaryConstituency: currentLangValue === 'ml' && loksabhaData[0].parliamentaryConstituencyMalayalam ? loksabhaData[0].parliamentaryConstituencyMalayalam : loksabhaData[0].parliamentaryConstituency } })}
            </button>
          </div>
          <div class="loksabha-chart-wrapper" class:hidden={!loksabhaVisible}>
            <LoksabhaChart data={loksabhaData} loading={historicalLoading} error={historicalError} />
          </div>
        {/if}
        <div class="modal-footer">
          <a href="/KLA2026/about" class="modal-report-link" title={$_('footer.reportIssues')}>
            ⚠️ {$_('footer.reportIssues')}
          </a>
        </div>
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
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  .modal-title {
    font-family: 'Manjari', sans-serif;
    font-size: var(--fs-xl);
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
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
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
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
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
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    letter-spacing: 0.08em;
    color: var(--muted);
    text-transform: uppercase;
  }

  .stat-value {
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xl);
    font-weight: 700;
    color: var(--text);
  }

  .stat-breakdown {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    color: var(--muted);
  }

  .voters-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 14px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .voters-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .voters-count {
    font-family: 'Manjari', sans-serif;
    font-size: var(--fs-xl);
    font-weight: 700;
    color: var(--text);
  }

  .voters-bar-wrapper {
    display: flex;
    height: 16px;
    border-radius: 4px;
    overflow: hidden;
    background: var(--bg2);
  }

  .voters-bar-segment {
    height: 100%;
  }

  .voters-bar-segment.male { background: #3B82F6; }
  .voters-bar-segment.female { background: #EC4899; }
  .voters-bar-segment.trans { background: #8B5CF6; }

  .voters-legend {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    color: var(--muted);
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .legend-dot.male { background: #3B82F6; }
  .legend-dot.female { background: #EC4899; }
  .legend-dot.trans { background: #8B5CF6; }

  .modal-body { padding: 20px; }

  .modal-section-label {
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
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
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
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
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    font-weight: 600;
    letter-spacing: 0.1em;
    opacity: 0.7;
  }

  .candidate-name {
    font-family: 'Manjari', sans-serif;
    font-weight: 600;
    font-size: var(--fs-base);
    margin-top: 2px;
    color: #000;
  }

  .candidate-party {
    font-size: var(--fs-sm);
    color: var(--text-soft);
    margin-top: 2px;
  }

  .candidate-name.tbd {
    color: var(--muted);
    font-style: italic;
  }

  .modal-footer {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }

  .modal-report-link {
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    color: var(--gold);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: color 0.2s;
  }

  .modal-report-link:hover {
    color: var(--gold-mid);
  }

  .modal-report-link:hover {
    opacity: 1;
  }
</style>
