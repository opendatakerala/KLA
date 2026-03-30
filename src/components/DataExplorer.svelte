<script>
  import { _ } from '../lib/i18n.js';
  import FilterBar from './FilterBar.svelte';
  import DataDisplay from './DataDisplay.svelte';
  import SearchBar from './SearchBar.svelte';
  import { 
    filters, 
    clearFilters,
    setSearch,
    setReservation,
    toggleWomen,
    setParty,
    setDistrict
  } from '../stores/constituencyStore.js';

  let filtersOpen = $state(false);

  function toggleFilters() {
    filtersOpen = !filtersOpen;
  }
</script>

<div class="data-explorer" id="data-explorer">
  <div class="explorer-toolbar desktop-only">
    <button 
      class="filters-toggle"
      class:active={filtersOpen}
      onclick={toggleFilters}
    >
      <span class="toggle-icon">{filtersOpen ? '▼' : '▶'}</span>
      {$_('filters.filters')}
    </button>
  </div>

  <div class="mobile-search-wrap mobile-only">
    <SearchBar />
  </div>

  <div class="explorer-toolbar mobile-only">
    <button 
      class="filters-toggle"
      class:active={filtersOpen}
      onclick={toggleFilters}
    >
      <span class="toggle-icon">{filtersOpen ? '▼' : '▶'}</span>
      {$_('filters.filters')}
    </button>
  </div>

  <div class="explorer-filters" class:hidden={!filtersOpen}>
    <FilterBar />
  </div>

  <div class="active-filters">
    {#if $filters.search || $filters.reservation !== 'all' || $filters.women || $filters.party !== 'all' || $filters.district !== 'all'}
      {#if $filters.search}
        <span class="active-tag">
          Search: "{$filters.search}"
          <button class="tag-remove" onclick={() => setSearch('')}>×</button>
        </span>
      {/if}
      {#if $filters.reservation !== 'all'}
        <span class="active-tag reservation {$filters.reservation.toLowerCase()}">
          {$filters.reservation}
          <button class="tag-remove" onclick={() => setReservation('all')}>×</button>
        </span>
      {/if}
      {#if $filters.women}
        <span class="active-tag women">
          Women
          <button class="tag-remove" onclick={toggleWomen}>×</button>
        </span>
      {/if}
      {#if $filters.party !== 'all'}
        <span class="active-tag party">
          {$filters.party}
          <button class="tag-remove" onclick={() => setParty('all')}>×</button>
        </span>
      {/if}
      {#if $filters.district !== 'all'}
        <span class="active-tag district">
          {$filters.district}
          <button class="tag-remove" onclick={() => setDistrict('all')}>×</button>
        </span>
      {/if}
      <button class="clear-all-btn" onclick={clearFilters}>
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

  .explorer-toolbar {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  .filters-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s;
  }

  .filters-toggle:hover {
    border-color: var(--gold-mid);
    color: var(--text-soft);
  }

  .filters-toggle.active {
    background: var(--gold-light);
    border-color: var(--gold-mid);
    color: var(--gold);
  }

  .toggle-icon {
    font-size: var(--fs-xs);
  }

  .explorer-filters {
    margin-bottom: 12px;
    animation: slideDown 0.2s ease;
  }

  .explorer-filters.hidden {
    display: none;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
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
    font-family: 'Manjari', monospace;
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
    font-family: 'Manjari', monospace;
    font-size: 10px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .clear-all-btn:hover {
    background: var(--card2);
    color: var(--text);
    border-color: var(--gold-mid);
  }

  .mobile-search-wrap {
    margin-bottom: 12px;
  }

  .desktop-only { display: block !important; }
  .mobile-only { display: none !important; }

  @media (max-width: 640px) {
    .desktop-only { display: none !important; }
    .mobile-only { display: block !important; }
  }
</style>