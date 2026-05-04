<script>
  import { _, locale } from '../lib/i18n.js';
  import { ALLIANCE_COLORS, ALLIANCE_BG } from '../lib/constants.js';
  import ConstituencyCard from './ConstituencyCard.svelte';
  import ResultsSearchBar from './ResultsSearchBar.svelte';
  import ResultsMap from './ResultsMap.svelte';

  const API_BASE = import.meta.env.PUBLIC_KLA_API_URL || '';

  let lang = $derived($locale);

  let loading = $state(false);
  let error = $state(false);
  let allConstituencies = $state([]);
  let searchTerm = $state('');

  let sortMode = $state('number');
  let sortOrder = $state('asc');

  let expandedMap = $state({});

  let summary = $derived(() => {
    if (!allConstituencies.length) return { total: 0, byAlliance: {} };
    const byAlliance = { LDF: 0, UDF: 0, NDA: 0, Others: 0 };
    for (const c of allConstituencies) {
      const sorted = [...c.candidates].sort((a, b) => b.votes - a.votes);
      if (sorted.length > 0 && sorted[0].votes > 0) {
        const winner = sorted[0];
        const alliance = ['LDF', 'UDF', 'NDA'].includes(winner.alliance) ? winner.alliance : 'Others';
        byAlliance[alliance]++;
      }
    }
    return { total: allConstituencies.length, byAlliance };
  });

  let constituencies = $derived(() => {
    const data = allConstituencies;
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(c => {
      const enName = c.constituency.constituency_Name.toLowerCase();
      const mlName = (c.constituency['constituency_Name_ (Malayalam)'] || '').toLowerCase();
      if (enName.includes(term) || mlName.includes(term)) return true;
      return c.candidates.some(candidate => {
        const enCandidate = (candidate.name || '').toLowerCase();
        const mlCandidate = (candidate.name_ml || '').toLowerCase();
        return enCandidate.includes(term) || mlCandidate.includes(term);
      });
    });
  });

  let sortedConstituencies = $derived(() => {
    if (!constituencies().length) return [];
    const dir = getSortDirection(sortMode);
    return [...constituencies()].sort((a, b) => {
      return (getSortValue(a, sortMode) - getSortValue(b, sortMode)) * dir;
    });
  });

  async function fetchResults() {
    loading = true;
    error = false;
    try {
      const res = await fetch(`${API_BASE}/api/kla2026/results/all.json`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      allConstituencies = json.data || [];
    } catch {
      error = true;
      allConstituencies = [];
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 60000);
    return () => clearInterval(interval);
  });

  function handleSearch(value) {
    searchTerm = value;
  }

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

  function getOverallMargin(c) {
    const sorted = [...c.candidates].sort((a, b) => b.votes - a.votes);
    if (sorted.length < 2) return 0;
    return sorted[0].votes - sorted[1].votes;
  }

  function getAllianceMargin(c, alliance) {
    const sorted = [...c.candidates].sort((a, b) => b.votes - a.votes);
    if (sorted.length === 0) return 0;
    const allianceCandidate = sorted.find(c => c.alliance === alliance);
    if (!allianceCandidate) {
      return -sorted[0].votes;
    }
    if (sorted[0].alliance === alliance) {
      return sorted.length > 1 ? sorted[0].votes - sorted[1].votes : sorted[0].votes;
    }
    return -(sorted[0].votes - allianceCandidate.votes);
  }

  function getSortValue(c, mode) {
    if (mode === 'number') return Number(c.constituency.constituency_Number);
    if (mode === 'lead') return getOverallMargin(c);
    if (mode === 'tight') return getOverallMargin(c);
    if (mode === 'lead-ldf' || mode === 'trail-ldf') return getAllianceMargin(c, 'LDF');
    if (mode === 'lead-udf' || mode === 'trail-udf') return getAllianceMargin(c, 'UDF');
    if (mode === 'lead-nda' || mode === 'trail-nda') return getAllianceMargin(c, 'NDA');
    return 0;
  }

  function getSortDirection(mode) {
    if (mode === 'number') return 1;
    if (mode.startsWith('lead')) return -1;
    if (mode.startsWith('trail')) return 1;
    if (mode === 'tight') return 1;
    return 1;
  }

  const sortOptions = [
    { value: 'number', label: 'Constituency #' },
    { value: 'lead', label: 'Clear Lead (Overall)' },
    { value: 'lead-ldf', label: 'Clear Lead (LDF)' },
    { value: 'lead-udf', label: 'Clear Lead (UDF)' },
    { value: 'lead-nda', label: 'Clear Lead (NDA)' },
    { value: 'trail-ldf', label: 'Clear Trail (LDF)' },
    { value: 'trail-udf', label: 'Clear Trail (UDF)' },
    { value: 'trail-nda', label: 'Clear Trail (NDA)' },
    { value: 'tight', label: 'Tight Fight' },
  ];
</script>

<div class="results-section" id="results-section">
  <div class="results-header">
    <h2 class="results-title">{$_('results.title')}</h2>
    <button class="reload-btn" onclick={fetchResults} disabled={loading}>
      {loading ? 'Updating...' : 'Reload'}
    </button>
  </div>

  {#if loading && allConstituencies.length === 0}
    <div class="component-loading">
      <div class="shimmer"></div>
      <span>{$_('charts.loading')}</span>
    </div>
  {:else if error}
    <div class="results-error">
      <span>{$_('charts.failedToLoad')}</span>
    </div>
  {:else if allConstituencies.length > 0}
    <div class="results-content">
      <div class="summary-section">
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

      <ResultsMap constituencies={allConstituencies} />

      <div class="results-toolbar">
        <ResultsSearchBar onSearch={handleSearch} value={searchTerm} />
        <select class="sort-select" value={sortMode} onchange={(e) => sortMode = e.target.value}>
          {#each sortOptions as opt}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
      </div>

      <div class="constituency-grid">
        {#each sortedConstituencies() as constituency}
          {@const key = constituency.constituency.constituency_Number}
          <ConstituencyCard
            constituency={constituency}
            lang={lang}
            expanded={expandedMap[key] || false}
            onClick={() => toggleConstituency(constituency)}
          />
        {/each}
      </div>

      {#if sortedConstituencies().length === 0 && searchTerm}
        <div class="results-empty">
          <span>No constituencies match "{searchTerm}"</span>
        </div>
      {/if}
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

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .results-title {
    font-size: var(--fs-xl);
    font-weight: 600;
    color: var(--text);
    margin-bottom: 0;
  }

  .reload-btn {
    padding: 6px 14px;
    border: 1px solid var(--border);
    background: var(--card2);
    border-radius: 6px;
    cursor: pointer;
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
    color: var(--text);
    transition: background 0.15s;
  }

  .reload-btn:hover:not(:disabled) {
    background: var(--border);
  }

  .reload-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

  .results-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  .sort-select {
    padding: 6px 12px;
    border: 1px solid var(--border);
    background: var(--card2);
    border-radius: 6px;
    cursor: pointer;
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
    color: var(--text);
    flex-shrink: 0;
    min-width: 180px;
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
    .results-toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .sort-select {
      min-width: auto;
      width: 100%;
    }

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
