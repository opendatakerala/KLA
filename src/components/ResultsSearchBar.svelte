<script>
  import { _ } from '../lib/i18n.js';

  let { onSearch, value = '' } = $props();

  let searchValue = $state(value);
  let inputElement = $state(null);

  function handleInput(e) {
    searchValue = e.target.value;
    onSearch(searchValue);
  }

  function handleClear() {
    searchValue = '';
    onSearch('');
    inputElement?.focus();
  }
</script>

<div class="results-search-wrapper">
  <span class="search-icon">
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="9" cy="9" r="6"/>
      <path d="M13.5 13.5L17 17"/>
    </svg>
  </span>
  <input
    bind:this={inputElement}
    type="text"
    class="results-search-input"
    placeholder="Search constituency or candidate…"
    value={searchValue}
    oninput={handleInput}
  />
  {#if searchValue}
    <button class="clear-search" onclick={handleClear}>
      <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4l12 12M16 4L4 16"/>
      </svg>
    </button>
  {/if}
</div>

<style>
  .results-search-wrapper {
    position: relative;
    flex: 1;
    max-width: 400px;
  }

  .search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    display: flex;
    pointer-events: none;
    z-index: 1;
  }

  .results-search-input {
    width: 100%;
    padding: 8px 32px 8px 32px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--card);
    color: var(--text);
    font-family: 'Manjari', sans-serif;
    font-size: var(--fs-sm);
  }

  .results-search-input:focus {
    outline: none;
    border-color: var(--gold-mid);
  }

  .results-search-input::placeholder {
    color: var(--muted);
  }

  .clear-search {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
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
    z-index: 1;
  }

  .clear-search:hover {
    background: var(--border);
    color: var(--text);
  }
</style>
