<script>
  import { _, setLanguage } from '../lib/i18n.js';
  import { filters, setSearch, getSuggestions } from '../stores/constituencyStore.js';
  
  let searchValue = $derived($filters.search);
  let suggestions = $state([]);
  let showSuggestions = $state(false);
  let inputElement = $state(null);
  let selectedIndex = $state(-1);
  
  function handleInput(e) {
    const value = e.target.value;
    setSearch(value);
    
    if (value.length >= 1) {
      suggestions = getSuggestions(value);
      showSuggestions = suggestions.length > 0;
      selectedIndex = -1;
    } else {
      suggestions = [];
      showSuggestions = false;
    }
    
    if (/[\u0D00-\u0D7F]/.test(value)) {
      setLanguage('ml');
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        selectSuggestion(suggestions[selectedIndex]);
      } else {
        const explorer = document.getElementById('data-explorer');
        if (explorer) {
          explorer.scrollIntoView({ behavior: 'smooth' });
        }
      }
      showSuggestions = false;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (selectedIndex < suggestions.length - 1) {
        selectedIndex++;
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (selectedIndex > 0) {
        selectedIndex--;
      }
    } else if (e.key === 'Escape') {
      showSuggestions = false;
    }
  }

  function selectSuggestion(suggestion) {
    setSearch(suggestion.text);
    showSuggestions = false;
    const explorer = document.getElementById('data-explorer');
    if (explorer) {
      explorer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handleBlur() {
    setTimeout(() => {
      showSuggestions = false;
    }, 200);
  }

  function handleFocus() {
    if (searchValue.length >= 1 && suggestions.length > 0) {
      showSuggestions = true;
    }
  }

  function handleClear() {
    setSearch('');
    suggestions = [];
    showSuggestions = false;
  }

  function getTypeLabel(type) {
    const labels = {
      'constituency': 'Constituency',
      'constituency-ml': 'Constituency',
      'district': 'District',
      'candidate': 'Candidate',
      'candidate-ml': 'Candidate',
      'party': 'Party'
    };
    return labels[type] || type;
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
      onfocus={handleFocus}
      onblur={handleBlur}
    />
    {#if searchValue}
      <button class="clear-search" onclick={handleClear}>
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4l12 12M16 4L4 16"/>
        </svg>
      </button>
    {/if}
    {#if showSuggestions}
      <ul class="suggestions-list">
        {#each suggestions as suggestion, index}
          <li 
            class="suggestion-item"
            class:selected={index === selectedIndex}
            onclick={() => selectSuggestion(suggestion)}
            onmouseenter={() => selectedIndex = index}
          >
            <span class="suggestion-text">{suggestion.text}</span>
            <span class="suggestion-type">{getTypeLabel(suggestion.type)}</span>
          </li>
        {/each}
      </ul>
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
    z-index: 10;
  }

  .search-input {
    flex: 1;
    padding: 8px 32px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg);
    color: var(--text);
    font-family: 'Manjari', sans-serif;
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
    z-index: 10;
  }

  .clear-search:hover {
    background: var(--bg);
    color: var(--text);
  }

  .suggestions-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin: 4px 0 0 0;
    padding: 0;
    list-style: none;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-height: 300px;
    overflow-y: auto;
    z-index: 100;
  }

  .suggestion-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    font-family: 'Manjari', sans-serif;
    font-size: var(--fs-base);
    color: var(--text);
    border-bottom: 1px solid var(--border);
  }

  .suggestion-item:last-child {
    border-bottom: none;
  }

  .suggestion-item:hover,
  .suggestion-item.selected {
    background: var(--card2);
  }

  .suggestion-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .suggestion-type {
    font-size: var(--fs-xs);
    color: var(--muted);
    margin-left: 8px;
    flex-shrink: 0;
  }
</style>