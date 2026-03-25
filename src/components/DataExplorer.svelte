<script>
  import FilterBar from './FilterBar.svelte';
  import SearchBar from './SearchBar.svelte';
  import DataDisplay from './DataDisplay.svelte';
  import { 
    filters, 
    clearFilters,
    setSearch,
    setReservation,
    toggleWomen,
    setParty,
    setDistrict
  } from '../stores/constituencyStore.js';
</script>

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

  <DataDisplay />
</div>

<style>
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
</style>