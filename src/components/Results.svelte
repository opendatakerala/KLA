<script>
  import { _ } from '../lib/i18n.js';
  import { ALLIANCE_COLORS, ALLIANCE_BG } from '../lib/constants.js';
  import { resultStore } from '../stores/resultStore.js';

  let results = $derived($resultStore);
  let loading = $derived(results?.loading || false);
  let error = $derived(results?.error ? true : false);
  let data = $derived(results?.data || null);
  let constituencies = $derived(data?.data || []);

  let selectedConstituency = $state(null);

  let summary = $derived(() => {
    if (!constituencies.length) return { total: 0, byAlliance: {} };
    const byAlliance = { LDF: 0, UDF: 0, NDA: 0, Others: 0 };
    for (const c of constituencies) {
      const sorted = [...c.candidates].sort((a, b) => b.votes - a.votes);
      if (sorted.length > 0 && sorted[0].votes > 0) {
        const winner = sorted[0];
        const alliance = ['LDF', 'UDF', 'NDA'].includes(winner.alliance) ? winner.alliance : 'Others';
        byAlliance[alliance]++;
      }
    }
    return { total: constituencies.length, byAlliance };
  });

  let sortedConstituencies = $derived(() => {
    if (!constituencies.length) return [];
    return [...constituencies].sort((a, b) => {
      return Number(a.constituency.constituency_Number) - Number(b.constituency.constituency_Number);
    });
  });

  function selectConstituency(constituency) {
    selectedConstituency = constituency;
  }

  function getAllianceColor(alliance) {
    return ALLIANCE_COLORS[alliance] || ALLIANCE_COLORS.Others;
  }

  function getAllianceBg(alliance) {
    return ALLIANCE_BG[alliance] || ALLIANCE_BG.Others;
  }

  function getWinner(candidates) {
    const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
    return sorted[0];
  }

  function formatVotes(votes) {
    return Number(votes).toLocaleString('en-IN');
  }
</script>

<div class="results-section" id="results-section">
  <h2 class="results-title">{$_('results.title')}</h2>

  {#if loading}
    <div class="component-loading">
      <div class="shimmer"></div>
      <span>{$_('charts.loading')}</span>
    </div>
  {:else if error}
    <div class="results-error">
      <span>{$_('charts.failedToLoad')}</span>
    </div>
  {:else if constituencies.length > 0}
    <div class="results-content">
      <div class="summary-section">
        <h3 class="summary-title">Summary</h3>
        <div class="summary-cards">
          <div class="summary-card total">
            <span class="card-label">Total Constituencies</span>
            <span class="card-value">{summary().total}</span>
          </div>
          {#each Object.entries(summary().byAlliance) as [alliance, count]}
            <div class="summary-card" style="background: {getAllianceBg(alliance)}">
              <span class="card-label">{alliance}</span>
              <span class="card-value" style="color: {getAllianceColor(alliance)}">{count}</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="constituency-results">
        <div class="constituency-list">
          <h4 class="list-title">Constituencies</h4>
          <div class="list-scroll">
            {#each sortedConstituencies() as constituency}
              <button
                class="constituency-item"
                class:active={selectedConstituency === constituency}
                onclick={() => selectConstituency(constituency)}
              >
                <span class="constituency-number">{constituency.constituency.constituency_Number}</span>
                <span class="constituency-name">{constituency.constituency.constituency_Name}</span>
                <span class="constituency-district">{constituency.constituency.district}</span>
              </button>
            {/each}
          </div>
        </div>

        <div class="result-detail">
          {#if selectedConstituency}
            <div class="detail-header">
              <h3 class="detail-title">
                {selectedConstituency.constituency.constituency_Name}
              </h3>
              <span class="detail-district">{selectedConstituency.constituency.district}</span>
            </div>

            <div class="detail-info">
              <div class="info-item">
                <span class="info-label">Region</span>
                <span class="info-value">{selectedConstituency.constituency.region}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Total Voters</span>
                <span class="info-value">{formatVotes(selectedConstituency.constituency['Voters Total'])}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Polling %</span>
                <span class="info-value">{selectedConstituency.constituency['Polling % (2026)']}%</span>
              </div>
            </div>

            <div class="candidates-table">
              <div class="table-header">
                <span class="col-rank">#</span>
                <span class="col-candidate">Candidate</span>
                <span class="col-party">Party</span>
                <span class="col-alliance">Alliance</span>
                <span class="col-votes">Votes</span>
              </div>
              {#each [...selectedConstituency.candidates].sort((a, b) => b.votes - a.votes) as candidate, index}
                <div class="table-row" style="border-left: 4px solid {getAllianceColor(candidate.alliance)}">
                  <span class="col-rank">{index + 1}</span>
                  <span class="col-candidate">
                    <span class="candidate-name">{candidate.name}</span>
                    {#if candidate.name_ml}
                      <span class="candidate-name-ml">{candidate.name_ml}</span>
                    {/if}
                  </span>
                  <span class="col-party">{candidate.party}</span>
                  <span class="col-alliance">
                    <span class="alliance-badge" style="background: {getAllianceBg(candidate.alliance)}; color: {getAllianceColor(candidate.alliance)}">
                      {candidate.alliance}
                    </span>
                  </span>
                  <span class="col-votes">{formatVotes(candidate.votes)}</span>
                </div>
              {/each}
            </div>
          {:else}
            <div class="detail-placeholder">
              <span>Select a constituency to view results</span>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="results-empty">
      <span>No results available</span>
    </div>
  {/if}
</div>

<style>
  .results-section {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    margin-bottom: 24px;
    padding: 20px;
  }

  .results-title {
    font-size: var(--fs-xl);
    font-weight: 600;
    color: var(--text);
    margin-bottom: 16px;
  }

  .component-loading {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--muted);
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
  }

  .shimmer {
    width: 60px;
    height: 60px;
    background: var(--card2);
    border-radius: 50%;
    position: relative;
    animation: pulse 1.5s infinite ease-in-out;
  }

  @keyframes pulse {
    0% { transform: scale(0.95); opacity: 0.5; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(0.95); opacity: 0.5; }
  }

  .results-error {
    text-align: center;
    padding: 20px;
    color: var(--muted);
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
  }

  .results-content {
  }

  .results-empty {
    text-align: center;
    padding: 20px;
    color: var(--muted);
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
  }

  .summary-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }

  .summary-title {
    font-size: var(--fs-lg);
    font-weight: 600;
    color: var(--text);
    margin-bottom: 12px;
  }

  .summary-cards {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .summary-card {
    padding: 16px 24px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 120px;
  }

  .summary-card.total {
    background: var(--card2);
  }

  .card-label {
    font-size: var(--fs-sm);
    color: var(--muted);
  }

  .card-value {
    font-size: var(--fs-xl);
    font-weight: 600;
    color: var(--text);
  }

  .constituency-results {
    display: flex;
    gap: 20px;
    min-height: 500px;
  }

  .constituency-list {
    width: 280px;
    flex-shrink: 0;
    border-right: 1px solid var(--border);
    padding-right: 16px;
  }

  .list-title {
    font-size: var(--fs-md);
    font-weight: 600;
    color: var(--text);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .list-scroll {
    max-height: 600px;
    overflow-y: auto;
  }

  .constituency-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
  }

  .constituency-item:hover {
    background: var(--card2);
  }

  .constituency-item.active {
    background: var(--gold-light);
  }

  .constituency-number {
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--muted);
    min-width: 24px;
  }

  .constituency-name {
    flex: 1;
    font-size: var(--fs-sm);
    color: var(--text);
    font-weight: 500;
  }

  .constituency-district {
    font-size: var(--fs-xs);
    color: var(--muted);
  }

  .result-detail {
    flex: 1;
    min-width: 0;
  }

  .detail-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--muted);
    font-size: var(--fs-sm);
  }

  .detail-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }

  .detail-title {
    font-size: var(--fs-lg);
    font-weight: 600;
    color: var(--text);
    margin-bottom: 4px;
  }

  .detail-district {
    font-size: var(--fs-sm);
    color: var(--muted);
  }

  .detail-info {
    display: flex;
    gap: 24px;
    margin-bottom: 20px;
    padding: 12px 16px;
    background: var(--card2);
    border-radius: 8px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .info-label {
    font-size: var(--fs-xs);
    color: var(--muted);
  }

  .info-value {
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--text);
  }

  .candidates-table {
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .table-header {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    background: var(--card2);
    font-size: var(--fs-xs);
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .table-row {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .table-row:hover {
    background: var(--card2);
  }

  .col-rank {
    width: 32px;
    font-size: var(--fs-sm);
    color: var(--muted);
    font-weight: 600;
  }

  .col-candidate {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .candidate-name {
    font-size: var(--fs-sm);
    font-weight: 500;
    color: var(--text);
  }

  .candidate-name-ml {
    font-size: var(--fs-xs);
    color: var(--muted);
  }

  .col-party {
    width: 180px;
    font-size: var(--fs-sm);
    color: var(--text-soft);
  }

  .col-alliance {
    width: 80px;
  }

  .alliance-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: var(--fs-xs);
    font-weight: 600;
    text-transform: uppercase;
  }

  .col-votes {
    width: 80px;
    text-align: right;
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--text);
  }
</style>
