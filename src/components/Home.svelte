<script>
  import { onMount } from 'svelte';
  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  import Disclaimer from './Disclaimer.svelte';
  import MapView from './MapView.svelte';
  import StatsSection from './StatsSection.svelte';
  import SearchBar from './SearchBar.svelte';
  import FilterBar from './FilterBar.svelte';
  import Grid from './Grid.svelte';
  import Modal from './Modal.svelte';
  import { initLanguage } from '../lib/i18n.js';
  import { 
    constituencies, 
    filters, 
    clearFilters,
    setSearch,
    setReservation,
    toggleWomen,
    setParty,
    setDistrict
  } from '../stores/constituencyStore.js';

  import constituencyData from '../data/constituencies.json';

  const stats = {
    ldf: constituencyData.filter(c => c.candidates.some(x => x.alliance === 'LDF' && x.name)).length,
    udf: constituencyData.filter(c => c.candidates.some(x => x.alliance === 'UDF' && x.name)).length,
    nda: constituencyData.filter(c => c.candidates.some(x => x.alliance === 'NDA' && x.name)).length,
    sc: constituencyData.filter(c => c.reservation === 'SC').length,
    st: constituencyData.filter(c => c.reservation === 'ST').length,
  };

  let viewMode = 'grid';

  $: {
    if (constituencyData.length > 0) {
      constituencies.set(constituencyData);
    }
  }

  function setView(mode) {
    viewMode = mode;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('viewPreference', mode);
    }
  }

  onMount(() => {
    constituencies.set(constituencyData);
    initLanguage();
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('viewPreference');
      if (saved === 'grid' || saved === 'map') {
        viewMode = saved;
      }
    }
  });
</script>

<Header totalCandidates="—" />

<div class="container">
  <StatsSection {stats} />
  
  <div class="data-explorer" id="data-explorer">
    <div class="explorer-filters">
      <FilterBar />
    </div>

    <div class="search-section">
      <SearchBar />
    </div>

    <div class="active-filters">
      {#if $filters.search || $filters.reservation !== 'all' || $filters.women || $filters.party !== 'all' || $filters.district !== 'all'}
        {#if $filters.search}
          <span class="active-tag">
            Search: "{$filters.search}"
            <button class="tag-remove" on:click={() => setSearch('')}>×</button>
          </span>
        {/if}
        {#if $filters.reservation !== 'all'}
          <span class="active-tag reservation {$filters.reservation.toLowerCase()}">
            {$filters.reservation}
            <button class="tag-remove" on:click={() => setReservation('all')}>×</button>
          </span>
        {/if}
        {#if $filters.women}
          <span class="active-tag women">
            Women
            <button class="tag-remove" on:click={toggleWomen}>×</button>
          </span>
        {/if}
        {#if $filters.party !== 'all'}
          <span class="active-tag party">
            {$filters.party}
            <button class="tag-remove" on:click={() => setParty('all')}>×</button>
          </span>
        {/if}
        {#if $filters.district !== 'all'}
          <span class="active-tag district">
            {$filters.district}
            <button class="tag-remove" on:click={() => setDistrict('all')}>×</button>
          </span>
        {/if}
        <button class="clear-all-btn" on:click={clearFilters}>
          Clear All
        </button>
      {/if}
    </div>

    <div class="view-tabs">
      <button 
        class="view-tab" 
        class:active={viewMode === 'grid'}
        on:click={() => setView('grid')}
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="16" height="14" rx="2"/><line x1="2" y1="8" x2="18" y2="8"/><line x1="2" y1="13" x2="18" y2="13"/><line x1="7" y1="8" x2="7" y2="17"/></svg>
        <span data-i18n="header.table">Table</span>
      </button>
      <button 
        class="view-tab" 
        class:active={viewMode === 'map'}
        on:click={() => setView('map')}
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 5l5-2 4 2 5-2v12l-5 2-4-2-5 2V5z"/><line x1="8" y1="3" x2="8" y2="17"/><line x1="12" y1="5" x2="12" y2="19"/></svg>
        <span data-i18n="header.map">Map</span>
      </button>
    </div>
    {#if viewMode === 'grid'}
      <Grid data={constituencyData} total={constituencyData.length} />
    {:else}
      <MapView data={constituencyData} />
    {/if}
  </div>
</div>

<Footer />
<Disclaimer />
<Modal />

<style>
  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .data-explorer {
    margin-bottom: 40px;
  }

  .explorer-filters {
    margin-bottom: 12px;
  }

  .search-section {
    margin-bottom: 16px;
  }

  .active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;
    min-height: 32px;
  }

  .active-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px 4px 10px;
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: 4px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--text);
  }

  .active-tag.reservation.sc {
    background: var(--sc-bg);
    border-color: var(--sc-color);
    color: var(--sc-color);
  }

  .active-tag.reservation.st {
    background: var(--st-bg);
    border-color: var(--st-color);
    color: var(--st-color);
  }

  .active-tag.women {
    background: #fce4ec;
    border-color: #EC4899;
    color: #EC4899;
  }

  .active-tag.party {
    background: var(--gold-light);
    border-color: var(--gold-mid);
    color: var(--gold);
  }

  .active-tag.district {
    background: var(--card);
    border-color: var(--gold-mid);
    color: var(--gold);
  }

  .tag-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: var(--muted);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s;
    padding: 0;
    line-height: 1;
  }

  .tag-remove:hover {
    background: var(--bg);
    color: var(--text);
  }

  .clear-all-btn {
    padding: 4px 10px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .clear-all-btn:hover {
    background: var(--card2);
    color: var(--text);
    border-color: var(--gold-mid);
  }

  .view-tabs {
    display: flex;
    gap: 2px;
    background: var(--bg2);
    border-radius: 6px;
    padding: 2px;
  }

  .view-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .view-tab svg {
    width: 16px;
    height: 16px;
  }

  .view-tab:hover {
    color: var(--text);
    background: var(--card);
  }

  .view-tab.active {
    background: var(--card);
    color: var(--gold);
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .clear-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .clear-btn:hover {
    background: var(--card2);
    color: var(--text);
  }
</style>
