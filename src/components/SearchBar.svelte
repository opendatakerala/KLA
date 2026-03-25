<script>
  import { filters, setSearch, searchSuggestions, constituencies } from '../stores/constituencyStore.js';
  
  let searchValue = '';
  let showSuggestions = false;
  let inputElement;
  
  $: searchValue = $filters.search;
  $: suggestions = $searchSuggestions;
  $: showSuggestions = searchValue.length >= 2 && suggestions.length > 0;
  
  function handleSearch() {
    setSearch(searchValue);
    showSuggestions = false;
  }
  
  function handleClear() {
    searchValue = '';
    setSearch('');
    showSuggestions = false;
  }
  
  function handleSelect(value) {
    searchValue = value;
    setSearch(value);
    showSuggestions = false;
    inputElement?.blur();
  }
  
  function handleKeydown(e) {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      showSuggestions = false;
      inputElement?.blur();
    }
  }
  
  function handleFocus() {
    if (searchValue.length >= 2 && suggestions.length > 0) {
      showSuggestions = true;
    }
  }
  
  function handleBlur() {
    // Delay to allow click on suggestion
    setTimeout(() => {
      showSuggestions = false;
    }, 200);
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
      bind:this={inputElement}
      on:keydown={handleKeydown}
      on:focus={handleFocus}
      on:blur={handleBlur}
    />
    <button class="search-btn" id="search-btn" on:click={handleSearch}>
      <span data-i18n="header.search">Search</span>
    </button>
    
    {#if showSuggestions}
      <div class="suggestions-dropdown">
        {#each suggestions as item}
          <button class="suggestion-item" on:click={() => handleSelect(item.value)}>
            <span class="suggestion-icon">
              {#if item.type === 'constituency'}📍{:else if item.type === 'candidate'}👤{:else}🏛{/if}
            </span>
            <span class="suggestion-label">{item.label}</span>
            <span class="suggestion-sub">{item.sublabel}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
  <button class="clear-btn" id="clear-btn" on:click={handleClear}>
    <span data-i18n="header.clear">Clear</span>
  </button>
</div>

<style>
  .search-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .search-input-wrapper {
    display: flex;
    flex: 1;
    max-width: 400px;
    position: relative;
  }

  .search-input {
    flex: 1;
    padding: 8px 12px;
    padding-right: 50px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--gold-mid);
  }

  .search-btn {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    padding: 4px 10px;
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .search-btn:hover {
    background: var(--card);
    color: var(--text);
  }

  .suggestions-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 6px;
    margin-top: 4px;
    max-height: 320px;
    overflow-y: auto;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    background: transparent;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s;
  }

  .suggestion-item:hover {
    background: var(--card2);
  }

  .suggestion-icon {
    font-size: 14px;
    flex-shrink: 0;
  }

  .suggestion-label {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: var(--text);
    flex: 1;
  }

  .suggestion-sub {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--muted);
    text-align: right;
  }

  .clear-btn {
    padding: 8px 12px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .clear-btn:hover {
    background: var(--card2);
    color: var(--text);
  }
</style>
