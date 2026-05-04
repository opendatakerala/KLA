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

  let sortMode = $state('lead');
  let sortOrder = $state('asc');

  let expandedMap = $state({});

  let filterOpen = $state(false);
  let sittingFilter = $state('');
  let selectedParties = $state([]);
  let selectedDistricts = $state([]);

  let summary = $derived(() => {
    if (!allConstituencies.length) return { total: 0, byAlliance: {}, byParty: {}, votesAlliance: {}, votesPartyByAlliance: {}, totalVotes: 0 };
    const byAlliance = { LDF: 0, UDF: 0, NDA: 0, Others: 0 };
    const votesAlliance = { LDF: 0, UDF: 0, NDA: 0, Others: 0 };
    const byParty = { LDF: {}, UDF: {}, NDA: {}, Others: {} };
    const votesPartyByAlliance = { LDF: {}, UDF: {}, NDA: {}, Others: {} };
    let totalPolled = 0;
    for (const c of allConstituencies) {
      totalPolled += c.candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
      const sorted = [...c.candidates].sort((a, b) => b.votes - a.votes);
      if (sorted.length > 0 && sorted[0].votes > 0) {
        const winner = sorted[0];
        const alliance = ['LDF', 'UDF', 'NDA'].includes(winner.alliance) ? winner.alliance : 'Others';
        byAlliance[alliance]++;
        byParty[alliance][winner.party] = (byParty[alliance][winner.party] || 0) + 1;
      }
      for (const candidate of c.candidates) {
        const alliance = ['LDF', 'UDF', 'NDA'].includes(candidate.alliance) ? candidate.alliance : 'Others';
        votesAlliance[alliance] += candidate.votes;
        votesPartyByAlliance[alliance][candidate.party] = (votesPartyByAlliance[alliance][candidate.party] || 0) + candidate.votes;
      }
    }
    return { total: allConstituencies.length, byAlliance, byParty, votesAlliance, votesPartyByAlliance, totalVotes: totalPolled };
  });

  let allParties = $derived(() => {
    const parties = new Set();
    for (const c of allConstituencies) {
      for (const candidate of c.candidates) {
        if (candidate.party) parties.add(candidate.party);
      }
    }
    return [...parties].sort();
  });

  let allDistricts = $derived(() => {
    const districts = new Set();
    for (const c of allConstituencies) {
      if (c.constituency.district) districts.add(c.constituency.district);
    }
    return [...districts].sort();
  });

  let constituencies = $derived(() => {
    let data = allConstituencies;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(c => {
        const enName = c.constituency.constituency_Name.toLowerCase();
        const mlName = (c.constituency['constituency_Name_ (Malayalam)'] || '').toLowerCase();
        if (enName.includes(term) || mlName.includes(term)) return true;
        return c.candidates.some(candidate => {
          const enCandidate = (candidate.name || '').toLowerCase();
          const mlCandidate = (candidate.name_ml || '').toLowerCase();
          return enCandidate.includes(term) || mlCandidate.includes(term);
        });
      });
    }

    if (sittingFilter) {
      data = data.filter(c => {
        const sorted = [...c.candidates].sort((a, b) => b.votes - a.votes);
        const leader = sorted[0];
        if (sittingFilter === 'won') {
          return leader?.sitting === 'YES';
        }
        if (sittingFilter === 'lost') {
          return c.candidates.some(candidate => candidate.sitting === 'YES' && candidate !== leader);
        }
        return true;
      });
    }

    if (selectedParties.length > 0) {
      data = data.filter(c => {
        return c.candidates.some(candidate => selectedParties.includes(candidate.party));
      });
    }

    if (selectedDistricts.length > 0) {
      data = data.filter(c => {
        return selectedDistricts.includes(c.constituency.district);
      });
    }

    return data;
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

  function toggleFilter(type, value) {
    if (type === 'sitting') {
      sittingFilter = sittingFilter === value ? '' : value;
    } else if (type === 'party') {
      if (selectedParties.includes(value)) {
        selectedParties = selectedParties.filter(p => p !== value);
      } else {
        selectedParties = [...selectedParties, value];
      }
    } else if (type === 'district') {
      if (selectedDistricts.includes(value)) {
        selectedDistricts = selectedDistricts.filter(d => d !== value);
      } else {
        selectedDistricts = [...selectedDistricts, value];
      }
    }
  }

  function removeFilter(type, value) {
    if (type === 'sitting') {
      sittingFilter = '';
    } else if (type === 'party') {
      selectedParties = selectedParties.filter(p => p !== value);
    } else if (type === 'district') {
      selectedDistricts = selectedDistricts.filter(d => d !== value);
    }
  }

  function clearAllFilters() {
    sittingFilter = '';
    selectedParties = [];
    selectedDistricts = [];
    searchTerm = '';
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

  function getVoteShare(c, votes) {
    const totalPolled = c.candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    if (!totalPolled || !votes) return 0;
    return (votes / totalPolled) * 100;
  }

  function getCountedPct(c) {
    const totalPolled = c.candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    if (!totalPolled) return 0;
    const countedVotes = c.candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    return (countedVotes / totalPolled) * 100;
  }

  function getOverallMargin(c) {
    const sorted = [...c.candidates].sort((a, b) => b.votes - a.votes);
    if (sorted.length < 2) return 0;
    return getVoteShare(c, sorted[0].votes) - getVoteShare(c, sorted[1].votes);
  }

  function getAllianceMargin(c, alliance) {
    const sorted = [...c.candidates].sort((a, b) => b.votes - a.votes);
    if (sorted.length === 0) return 0;
    const allianceCandidate = sorted.find(c => c.alliance === alliance);
    if (!allianceCandidate) {
      return -getVoteShare(c, sorted[0].votes);
    }
    if (sorted[0].alliance === alliance) {
      return sorted.length > 1 ? getVoteShare(c, sorted[0].votes) - getVoteShare(c, sorted[1].votes) : getVoteShare(c, sorted[0].votes);
    }
    return -(getVoteShare(c, sorted[0].votes) - getVoteShare(c, allianceCandidate.votes));
  }

  function getSortValue(c, mode) {
    if (mode === 'number') return Number(c.constituency.constituency_Number);
    if (mode === 'lead') return getOverallMargin(c);
    if (mode === 'tight') return getOverallMargin(c);
    if (mode === 'lead-ldf' || mode === 'trail-ldf') return getAllianceMargin(c, 'LDF');
    if (mode === 'lead-udf' || mode === 'trail-udf') return getAllianceMargin(c, 'UDF');
    if (mode === 'lead-nda' || mode === 'trail-nda') return getAllianceMargin(c, 'NDA');
    if (mode === 'count-high' || mode === 'count-low') {
      const pct = getCountedPct(c);
      const declared = c.constituency.resultDeclared !== 'NO' ? 200 : 0;
      return pct + declared;
    }
    return 0;
  }

  function getSortDirection(mode) {
    if (mode === 'number') return 1;
    if (mode.startsWith('lead')) return -1;
    if (mode.startsWith('trail')) return 1;
    if (mode === 'tight') return 1;
    if (mode === 'count-high') return -1;
    if (mode === 'count-low') return 1;
    return 1;
  }

  const sortOptions = [
    { value: 'number', label: 'Constituency #' },
    { value: 'lead', label: 'Best Performance (Overall)' },
    { value: 'lead-ldf', label: 'Best Performance (LDF)' },
    { value: 'lead-udf', label: 'Best Performance (UDF)' },
    { value: 'lead-nda', label: 'Best Performance (NDA)' },
    { value: 'trail-ldf', label: 'Worst Performance (LDF)' },
    { value: 'trail-udf', label: 'Worst Performance (UDF)' },
    { value: 'trail-nda', label: 'Worst Performance (NDA)' },
    { value: 'tight', label: 'Tight Fight' },
    { value: 'count-high', label: 'Count - High' },
    { value: 'count-low', label: 'Count - Low' },
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
            <span class="card-votes">{Number(Math.round(summary().totalVotes)).toLocaleString('en-IN')} votes</span>
          </div>
          {#each Object.entries(summary().byAlliance).sort((a, b) => b[1] - a[1]) as [alliance, count]}
            {@const pct = summary().totalVotes > 0 ? (summary().votesAlliance[alliance] / summary().totalVotes * 100).toFixed(1) : '0.0'}
            <div class="summary-card alliance-card" style="background: {getAllianceBg(alliance)}">
              <span class="card-label">{alliance}</span>
              <span class="card-value" style="color: {getAllianceColor(alliance)}">{count}</span>
              <span class="card-votes">{Number(summary().votesAlliance[alliance]).toLocaleString('en-IN')} ({pct}%)</span>
              <span class="card-separator"></span>
              {#each Object.entries(summary().byParty[alliance] || {}).sort((a, b) => b[1] - a[1]) as [party, partyCount]}
                {#if partyCount > 0}
                  {@const partyVotes = summary().votesPartyByAlliance[alliance]?.[party] || 0}
                  {@const partyPct = summary().totalVotes > 0 ? (partyVotes / summary().totalVotes * 100).toFixed(1) : '0.0'}
                  <span class="card-party">{partyCount} - {party} ({Number(partyVotes).toLocaleString('en-IN')} votes, {partyPct}%)</span>
                {/if}
              {/each}
            </div>
          {/each}
        </div>
      </div>

      <ResultsMap constituencies={allConstituencies} />

      <div class="results-toolbar">
        <ResultsSearchBar onSearch={handleSearch} value={searchTerm} />
        <div class="toolbar-actions">
          <button class="filter-toggle" onclick={() => filterOpen = !filterOpen} class:active={filterOpen}>
            Filters
            {#if sittingFilter || selectedParties.length > 0 || selectedDistricts.length > 0}
              <span class="filter-count">{[sittingFilter ? 1 : 0, selectedParties.length, selectedDistricts.length].reduce((a, b) => a + b, 0)}</span>
            {/if}
          </button>
          <select class="sort-select" value={sortMode} onchange={(e) => sortMode = e.target.value}>
            {#each sortOptions as opt}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </div>
      </div>

      {#if filterOpen}
        <div class="filter-panel">
          <div class="filter-section">
            <h4 class="filter-heading">Sitting MLA</h4>
            <div class="filter-options">
              <button class="filter-btn" class:active={sittingFilter === 'won'} onclick={() => toggleFilter('sitting', 'won')}>
                Won
              </button>
              <button class="filter-btn" class:active={sittingFilter === 'lost'} onclick={() => toggleFilter('sitting', 'lost')}>
                Lost
              </button>
            </div>
          </div>

          <div class="filter-section">
            <h4 class="filter-heading">Party</h4>
            <div class="filter-options">
              {#each allParties() as party}
                <button class="filter-btn" class:active={selectedParties.includes(party)} onclick={() => toggleFilter('party', party)}>
                  {party}
                </button>
              {/each}
            </div>
          </div>

          <div class="filter-section">
            <h4 class="filter-heading">District</h4>
            <div class="filter-options">
              {#each allDistricts() as district}
                <button class="filter-btn" class:active={selectedDistricts.includes(district)} onclick={() => toggleFilter('district', district)}>
                  {district}
                </button>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      {#if sittingFilter || selectedParties.length > 0 || selectedDistricts.length > 0 || searchTerm}
        <div class="active-filters">
          <span class="filter-label">Active filters:</span>
          {#if searchTerm}
            <span class="filter-tag">
              Search: "{searchTerm}"
              <button class="filter-remove" onclick={() => searchTerm = ''}>×</button>
            </span>
          {/if}
          {#if sittingFilter === 'won'}
            <span class="filter-tag">
              Sitting MLA Won
              <button class="filter-remove" onclick={() => removeFilter('sitting')}>×</button>
            </span>
          {/if}
          {#if sittingFilter === 'lost'}
            <span class="filter-tag">
              Sitting MLA Lost
              <button class="filter-remove" onclick={() => removeFilter('sitting')}>×</button>
            </span>
          {/if}
          {#each selectedParties as party}
            <span class="filter-tag">
              {party}
              <button class="filter-remove" onclick={() => removeFilter('party', party)}>×</button>
            </span>
          {/each}
          {#each selectedDistricts as district}
            <span class="filter-tag">
              {district}
              <button class="filter-remove" onclick={() => removeFilter('district', district)}>×</button>
            </span>
          {/each}
          <button class="clear-filters" onclick={clearAllFilters}>Clear All</button>
        </div>
      {/if}

      <div class="constituency-grid">
        {#each sortedConstituencies() as constituency (constituency.constituency.constituency_Number)}
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

  .toolbar-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .filter-toggle {
    padding: 6px 14px;
    border: 1px solid var(--border);
    background: var(--card2);
    border-radius: 6px;
    cursor: pointer;
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
    color: var(--text);
    transition: background 0.15s;
    position: relative;
  }

  .filter-toggle:hover {
    background: var(--border);
  }

  .filter-toggle.active {
    background: var(--gold);
    color: var(--card);
    border-color: var(--gold);
  }

  .filter-count {
    background: var(--text);
    color: var(--card);
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 10px;
    margin-left: 4px;
  }

  .filter-panel {
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .filter-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .filter-heading {
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }

  .filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .filter-btn {
    padding: 4px 12px;
    border: 1px solid var(--border);
    background: var(--card);
    border-radius: 4px;
    cursor: pointer;
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    color: var(--text);
    transition: all 0.15s;
  }

  .filter-btn:hover {
    background: var(--border);
  }

  .filter-btn.active {
    background: var(--gold);
    color: var(--card);
    border-color: var(--gold);
  }

  .active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px;
    background: var(--card2);
    border-radius: 8px;
  }

  .filter-label {
    font-size: var(--fs-sm);
    color: var(--muted);
    font-weight: 600;
  }

  .filter-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 4px;
    font-size: var(--fs-xs);
    color: var(--text);
  }

  .filter-remove {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: var(--muted);
    padding: 0 2px;
    line-height: 1;
  }

  .filter-remove:hover {
    color: var(--text);
  }

  .clear-filters {
    padding: 4px 12px;
    border: 1px solid var(--border);
    background: var(--card);
    border-radius: 4px;
    cursor: pointer;
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    color: var(--text);
    margin-left: auto;
  }

  .clear-filters:hover {
    background: var(--border);
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

  .card-votes {
    font-size: var(--fs-sm);
    color: var(--muted);
    font-weight: 500;
  }

  .card-party {
    font-size: var(--fs-xs);
    color: var(--text-soft);
    font-weight: 500;
  }

  .card-separator {
    display: block;
    height: 1px;
    background: rgba(0, 0, 0, 0.15);
    margin: 6px 0;
    width: 100%;
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
