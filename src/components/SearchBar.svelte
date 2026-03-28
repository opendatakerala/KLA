<script>
  import { _, setLanguage } from '../lib/i18n.js';
  import { filters, setSearch } from '../stores/constituencyStore.js';
  
  let searchValue = $derived($filters.search);
  
  function handleInput(e) {
    const value = e.target.value;
    setSearch(value);
    
    if (/[\u0D00-\u0D7F]/.test(value)) {
      setLanguage('ml');
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      const explorer = document.getElementById('data-explorer');
      if (explorer) {
        explorer.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  function handleClear() {
    setSearch('');
  }
</script>

<div class="search-row">
  <div class="search-input-wrapper">
    <span class="search-icon">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="9" r="6"/>
        <path d="M13.5 13.5L17 17"/>
      </svg>
    </span>
    <input 
      type="text" 
      id="search" 
      class="search-input" 
      placeholder={$_('header.searchPlaceholder')}
      value={searchValue}
      oninput={handleInput}
      onkeydown={handleKeydown}
    />
    {#if searchValue}
      <button class="clear-search" onclick={handleClear}>
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4l12 12M16 4L4 16"/>
        </svg>
      </button>
    {/if}
  </div>
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
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 10px;
    color: var(--muted);
    display: flex;
    pointer-events: none;
  }

  .search-input {
    flex: 1;
    padding: 8px 32px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    font-size: var(--fs-base);
    width: 100%;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--gold-mid);
  }

  .search-input::placeholder {
    color: var(--muted);
  }

  .clear-search {
    position: absolute;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: var(--card2);
    border: none;
    border-radius: 50%;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s;
    padding: 0;
  }

  .clear-search:hover {
    background: var(--bg);
    color: var(--text);
  }
</style>