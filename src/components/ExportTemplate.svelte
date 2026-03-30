<script>
  import { _, currentLang, isLoading } from '../lib/i18n.js';
  import { ldfCandidates, udfCandidates, ndaCandidates, othersCandidates, getCandidateName, getConstituencyName } from '../stores/candidateStore.js';
  import { historicalDataStore } from '../stores/historicalStore.js';
  import NiyamasabhaChart from './charts/NiyamasabhaChart.svelte';
  import LoksabhaChart from './charts/LoksabhaChart.svelte';

  let { constituency = null, loksabhaVisible = false, onRootReady = null } = $props();

  let rootEl = $state(null);

  $effect(() => {
    if (rootEl && onRootReady) {
      onRootReady(rootEl);
    }
  });

  let currentLangValue = $derived($currentLang);
  let currentIsLoading = $derived($isLoading);
  
  let ldf = $derived($ldfCandidates);
  let udf = $derived($udfCandidates);
  let nda = $derived($ndaCandidates);
  let others = $derived($othersCandidates);

  function t(key) {
    return currentIsLoading ? key : $_(key);
  }

  let historicalData = $derived($historicalDataStore);
  let niyamasabhaData = $derived(historicalData?.data?.niyamasabha || []);
  let loksabhaData = $derived(historicalData?.data?.loksabha || []);
  let historicalLoading = $derived(historicalData?.loading || false);
  let historicalError = $derived(historicalData?.error ? true : false);

  function formatIndian(num) {
    if (!num) return '0';
    const n = parseInt(num, 10);
    return isNaN(n) ? '0' : n.toLocaleString('en-IN');
  }

  const ALLIANCE_COLORS = {
    LDF: '#D94040',
    UDF: '#1565C0',
    NDA: '#E07828',
    Others: '#33AA55'
  };
</script>

<div class="export-container" bind:this={rootEl}>
  <div class="export-header-stripe"></div>
  <div class="export-header">
    <div class="export-logo-wrap">
      <img class="export-logo" src="https://opendatakerala.org/LSG2025/assets/logo-DnFodOdy.png" alt="OpenDataKerala Logo" />
    </div>
    <div class="export-title">
      <div class="export-eyebrow">{$_('site.title')}</div>
      <h1>{$_('site.election')}</h1>
      <div class="export-tagline">
        <span>{$_('site.tagline')}</span>
        <span>&nbsp;&bull; <span>{$_('site.initiative')}</span></span>
      </div>
    </div>
  </div>

  {#if constituency}
    <div class="export-modal">
      <div class="modal-top"></div>
      <div class="modal-main">
        <div class="modal-main-content">
          <div class="modal-header">
            <div class="modal-eyebrow">
              {currentLangValue === 'ml' && constituency.districtMalayalam ? constituency.districtMalayalam : constituency.district} · {$_('modal.constituency')} #{constituency.number}
            </div>
            <div class="modal-title">{getConstituencyName(constituency, currentLangValue)}</div>
            <div class="modal-badges">
              {#if constituency.reservation}
                <span class="reservation-badge {constituency.reservation.toLowerCase()}">
                  {constituency.reservation}
                  <span>{$_('modal.reserved')}</span>
                </span>
              {/if}
            </div>
          </div>

          {#if constituency.pollingBooths || constituency.votersTotal}
            <div class="constituency-stats">
              <div class="stats-left">
                {#if constituency.pollingBooths}
                  <div class="stat-card">
                    <span class="stat-label">{$_('modal.pollingBooths')}</span>
                    <span class="stat-value">{formatIndian(constituency.pollingBooths)}</span>
                  </div>
                {/if}
                {#if constituency.votersTotal}
                  {@const total = parseInt(constituency.votersTotal) || 0}
                  {@const male = parseInt(constituency.votersMale) || 0}
                  {@const female = parseInt(constituency.votersFemale) || 0}
                  {@const trans = parseInt(constituency.votersTransgender) || 0}
                  {@const malePct = total > 0 ? Math.round((male / total) * 100) : 0}
                  {@const femalePct = total > 0 ? Math.round((female / total) * 100) : 0}
                  {@const transPct = total > 0 ? Math.round((trans / total) * 100) : 0}
                  <div class="voters-card">
                    <div class="voters-total">
                      <span class="stat-label">{$_('modal.voters')}</span>
                      <span class="voters-count">{formatIndian(constituency.votersTotal)}</span>
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
            </div>
          {/if}
        </div>
        <div class="modal-qr">
          <div class="qr-placeholder">
            <img class="qr-code" src="/KLA2026/url-qr-code.png" alt="QR Code" />
            <span class="qr-text">https://opendatakerala.org/KLA2026/</span>
          </div>
        </div>
      </div>

      <div class="modal-body">
        <div class="export-content">
          <div class="export-candidates">
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
          </div>

          <div class="export-charts">
            <div class="modal-section-label">
              {$_('modal.historicalResultsNiyamasabha')}
            </div>
            <NiyamasabhaChart constituencyNumber={constituency.number} data={niyamasabhaData} loading={historicalLoading} error={historicalError} forceView="bars" />

            <div class="modal-section-label loksabha-section">
              {$_('modal.partOfParliamentaryConstituency', { values: { parliamentaryConstituency: constituency.qid && loksabhaData?.[0]?.parliamentaryConstituency ? (currentLangValue === 'ml' && loksabhaData[0].parliamentaryConstituencyMalayalam ? loksabhaData[0].parliamentaryConstituencyMalayalam : loksabhaData[0].parliamentaryConstituency) : 'Lok Sabha' } })}
            </div>
            <LoksabhaChart data={loksabhaData} loading={historicalLoading} error={historicalError} forceView="bars" />
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .export-container {
    width: 100%;
    height: 100%;
    background: var(--card);
    font-family: 'Manjari', sans-serif;
    color: #000;
    box-sizing: border-box;
  }

  .export-header-stripe {
    height: 4px;
    background: linear-gradient(90deg, var(--ldf) 25%, var(--udf) 25% 50%, var(--nda) 50% 75%, var(--others) 75%);
  }

  .export-header {
    padding: 20px 24px 14px;
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid var(--border);
    background: var(--card);
  }

  .export-logo-wrap { display: flex; align-items: center; flex-shrink: 0; }
  .export-logo { width: 48px; height: 48px; object-fit: contain; border-radius: 8px; }

  .export-title { flex: 1; }

  .export-eyebrow {
    font-family: 'Manjari', monospace;
    font-size: 13px;
    letter-spacing: 0.2em;
    color: #000;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .export-eyebrow::before {
    content: '';
    display: inline-block;
    width: 12px; height: 2px;
    background: #000;
    border-radius: 1px;
    margin-right: 8px;
    vertical-align: middle;
  }

  .export-title h1 {
    font-family: 'Manjari', sans-serif;
    font-size: 28px;
    font-weight: 900;
    line-height: 1.05;
    color: #000;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .export-tagline {
    font-size: 14px;
    color: #000;
    font-weight: 700;
    margin-top: 2px;
  }

  .export-tagline span {
    color: var(--gold);
    font-weight: 600;
    font-style: italic;
  }

  .export-modal {
    background: var(--card);
    border: 1px solid var(--border);
  }

  .modal-top {
    height: 4px;
    background: linear-gradient(90deg, var(--ldf), var(--udf), var(--nda));
  }

  .modal-main {
    display: flex;
  }

  .modal-main-content {
    flex: 1;
  }

  .modal-qr {
    width: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    border-bottom: 1px solid var(--border);
  }

  .modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }

  .modal-eyebrow {
    font-family: 'Manjari', monospace;
    font-size: 13px;
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  .modal-title {
    font-family: 'Manjari', sans-serif;
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
    font-family: 'Manjari', monospace;
    font-size: 12px;
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

  .constituency-stats {
    padding: 16px 20px;
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
  }

  .stats-left {
    display: block;
  }

  .stat-card {
    display: inline-block;
    padding: 10px 14px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    margin-right: 12px;
    vertical-align: top;
  }

  .stat-label {
    font-size: 10px;
    color: var(--muted);
    text-transform: uppercase;
  }

  .stat-value {
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    display: block;
  }

  .voters-card {
    display: inline-block;
    padding: 12px 14px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    max-width: 300px;
    vertical-align: top;
  }

  .voters-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .voters-count {
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
  }

  .voters-bar-wrapper {
    display: flex;
    height: 16px;
    border-radius: 4px;
    overflow: hidden;
    background: var(--bg2);
    margin: 8px 0;
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
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
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
    font-size: 12px;
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
    font-size: 12px;
    letter-spacing: 0.08em;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 12px;
    margin-top: 24px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .stats-left {
    display: flex;
    gap: 12px;
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
    font-size: 12px;
    letter-spacing: 0.08em;
    color: var(--muted);
    text-transform: uppercase;
  }

  .stat-value {
    font-family: 'Manjari', monospace;
    font-size: 22px;
    font-weight: 700;
    color: var(--text);
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
    max-width: 300px;
  }

  .voters-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .voters-count {
    font-family: 'Manjari', sans-serif;
    font-size: 22px;
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
    font-size: 12px;
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

  .export-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .export-candidates {
    display: flex;
    flex-direction: column;
  }

  .export-charts {
    display: flex;
    flex-direction: column;
  }

  .modal-section-label {
    font-family: 'Manjari', monospace;
    font-size: 12px;
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

  .candidate-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
    margin-bottom: 12px;
  }

  .candidate-row {
    display: flex;
    background: var(--card2);
    border-radius: 8px;
    overflow: hidden;
    min-height: 60px;
  }

  .alliance-bar {
    width: 4px;
    height: 50px;
    flex-shrink: 0;
  }

  .candidate-info {
    padding: 8px 10px;
    flex: 1;
    flex-shrink: 0;
  }

  .alliance-label {
    font-family: 'Manjari', monospace;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    opacity: 0.7;
  }

  .candidate-name {
    font-family: 'Manjari', sans-serif;
    font-weight: 600;
    font-size: 15px;
    margin-top: 2px;
    color: #000;
  }

  .candidate-party {
    font-size: 13px;
    color: var(--text-soft);
    margin-top: 2px;
  }

  .candidate-name.tbd {
    color: var(--muted);
    font-style: italic;
  }

  .qr-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .qr-code {
    width: 200px;
    height: 200px;
    object-fit: contain;
  }

  .qr-text {
    font-size: 11px;
    color: var(--muted);
    font-family: 'Manjari', monospace;
  }
</style>
