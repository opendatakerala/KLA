<script>
  import { filterStore, setFilter } from '../stores/gridStore.js';
  
  let activeFilter = 'all';
  
  filterStore.subscribe(value => {
    activeFilter = value;
  });
</script>

<div class="filter-row" id="filter-row">
  <button 
    class="filter-btn" 
    class:active={activeFilter === 'all'}
    data-filter="all" 
    on:click={() => setFilter('all')}
  >
    <span data-i18n="filters.all">All</span>
  </button>
  <button 
    class="filter-btn ldf"
    class:active={activeFilter === 'LDF'}
    data-filter="LDF"
    on:click={() => setFilter('LDF')}
  >
    LDF
  </button>
  <button 
    class="filter-btn udf"
    class:active={activeFilter === 'UDF'}
    data-filter="UDF"
    on:click={() => setFilter('UDF')}
  >
    UDF
  </button>
  <button 
    class="filter-btn nda"
    class:active={activeFilter === 'NDA'}
    data-filter="NDA"
    on:click={() => setFilter('NDA')}
  >
    NDA
  </button>
  <button 
    class="filter-btn"
    class:active={activeFilter === 'SC'}
    data-filter="SC" 
    on:click={() => setFilter('SC')}
  >
    <span data-i18n="filters.sc">SC Reserved</span>
  </button>
  <button 
    class="filter-btn"
    class:active={activeFilter === 'ST'}
    data-filter="ST" 
    on:click={() => setFilter('ST')}
  >
    <span data-i18n="filters.st">ST Reserved</span>
  </button>
  <button 
    class="filter-btn female"
    class:active={activeFilter === 'female'}
    data-filter="female"
    on:click={() => setFilter('female')}
  >
    ♀ <span data-i18n="filters.women">Women</span>
  </button>
</div>
