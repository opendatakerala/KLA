<script>
  import { districtStore, setDistrict } from '../stores/gridStore.js';
  
  export let districts = [];
  
  let activeDistrict = 'all';
  
  districtStore.subscribe(value => {
    activeDistrict = value;
  });
</script>

<div class="section-title" data-i18n="browse.title">Browse by District</div>
<div class="tabs" id="district-tabs">
  <div 
    class="tab" 
    class:active={activeDistrict === 'all'}
    data-district="all"
    on:click={() => setDistrict('all')}
  >
    <span data-i18n="browse.allDistricts">All Districts</span>
  </div>
  {#each districts as district}
    <div 
      class="tab" 
      class:active={activeDistrict === district}
      data-district={district}
      on:click={() => setDistrict(district)}
    >
      {district}
    </div>
  {/each}
</div>
