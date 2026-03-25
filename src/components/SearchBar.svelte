<script>
  import { searchStore, setSearch } from '../stores/gridStore.js';
  
  let searchValue = '';
  
  searchStore.subscribe(value => {
    searchValue = value;
  });
  
  function handleSearch() {
    setSearch(searchValue);
  }
  
  function handleClear() {
    searchValue = '';
    setSearch('');
  }
</script>

<div class="search-row">
  <div class="search-input-wrapper">
    <input 
      type="text" 
      id="search" 
      class="search-input" 
      placeholder="Search constituency, candidate…"
      data-i18n-placeholder="header.searchPlaceholder"
      bind:value={searchValue}
      on:keydown={(e) => e.key === 'Enter' && handleSearch()}
    />
    <button class="search-btn" id="search-btn" on:click={handleSearch}>
      <span data-i18n="header.search">Search</span>
    </button>
  </div>
  <button class="clear-btn" id="clear-btn" on:click={handleClear}>
    <span data-i18n="header.clear">Clear</span>
  </button>
</div>
