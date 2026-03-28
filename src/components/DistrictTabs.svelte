<script>
  import { _ } from '../lib/i18n.js';
  import { filters, setDistrict, districtList } from '../stores/constituencyStore.js';
  
  let activeDistrict = $derived($filters.district);
  let districts = $derived($districtList);
</script>

<div class="district-tabs">
  <div class="section-title">{$_('browse.title')}</div>
  <div class="tabs" id="district-tabs">
    <button 
      class="tab" 
      class:active={activeDistrict === 'all'}
      onclick={() => setDistrict('all')}
    >
      <span>{$_('browse.allDistricts')}</span>
    </button>
    {#each districts as district}
      <button 
        class="tab" 
        class:active={activeDistrict === district}
        onclick={() => setDistrict(district)}
      >
        {district}
      </button>
    {/each}
  </div>
</div>

<style>
  .district-tabs {
    margin-top: 12px;
  }

  .section-title {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--muted);
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .tabs {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .tab {
    padding: 6px 12px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .tab:hover {
    border-color: var(--gold-mid);
    color: var(--text-soft);
  }

  .tab.active {
    background: var(--gold-light);
    border-color: var(--gold-mid);
    color: var(--gold);
  }
</style>
