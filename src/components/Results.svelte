<script>
  import { _ } from '../lib/i18n.js';
  import { ALLIANCE_COLORS, ALLIANCE_BG } from '../lib/constants.js';
  import { resultStore } from '../stores/resultStore.js';
  import ConstituencyCard from './ConstituencyCard.svelte';

  let results = $derived($resultStore);
  let loading = $derived(results?.loading || false);
  let error = $derived(results?.error ? true : false);
  let data = $derived(results?.data || null);
  let constituencies = $derived(data?.data || []);

  let expandedMap = $state({});

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

  function toggleConstituency(constituency) {
    const key = constituency.constituency.constituency_Number;
    if (expandedMap[key]) {
      delete expandedMap[key];
    } else {
      expandedMap = {};
      expandedMap[key] = true;
    }
  }

  function getAllianceColor(alliance) {
    return ALLIANCE_COLORS[alliance] || ALLIANCE_COLORS.Others;
  }

  function getAllianceBg(alliance) {
    return ALLIANCE_BG[alliance] || ALLIANCE_BG.Others;
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
            <span class="card-label">Total</span>
            <span class="card-value">{summary().total}</span>
          </div>
          {#each Object.entries(summary().byAlliance) as [alliance, count]}
            <div class="summary-card alliance-card" style="background: {getAllianceBg(alliance)}">
              <span class="card-label">{alliance}</span>
              <span class="card-value" style="color: {getAllianceColor(alliance)}">{count}</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="constituency-grid">
        {#each sortedConstituencies() as constituency}
          {@const key = constituency.constituency.constituency_Number}
          <ConstituencyCard
            constituency={constituency}
            expanded={expandedMap[key] || false}
            onClick={() => toggleConstituency(constituency)}
          />
        {/each}
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
    padding: 12px 20px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 100px;
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

  .constituency-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  @media (max-width: 768px) {
    .summary-cards {
      flex-direction: column;
    }

    .summary-card {
      min-width: auto;
    }

    .constituency-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
