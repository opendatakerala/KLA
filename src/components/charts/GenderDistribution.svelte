<script>
  import { onMount } from 'svelte';
  import * as echarts from 'echarts';
  import genderData from '../../data/gender-distribution.json';
  import { _ } from '../../lib/i18n.js';
  import { KERALA_DISTRICTS } from '../../lib/constants.js';

  const { isActive = false } = $props();

  const TABS = ['overall', 'alliance', 'party', 'district'];
  function getTabLabel(tab) {
    return $_(`charts.${tab}`);
  }

  const ALLIANCES = ['LDF', 'UDF', 'NDA', 'Others'];

  let activeTab = $state('overall');
  let activeFilter = $state('overall');
  let chartContainer = $state(null);
  let chart = $state(null);
  let resizeObserver = $state(null);

  let currentData = $derived(getCurrentData(activeTab, activeFilter));
  let femaleCount = $derived(currentData?.female || 0);
  let maleCount = $derived(currentData?.male || 0);
  let transCount = $derived(currentData?.transgender || 0);
  let showTransgender = $derived(transCount > 0);
  let totalCount = $derived(femaleCount + maleCount + transCount + (currentData?.unknown || 0));
  let femalePct = $derived(totalCount > 0 ? ((femaleCount / totalCount) * 100).toFixed(1) : 0);
  let malePct = $derived(totalCount > 0 ? ((maleCount / totalCount) * 100).toFixed(1) : 0);
  let transPct = $derived(totalCount > 0 ? ((transCount / totalCount) * 100).toFixed(1) : 0);

  let tabsWithFloat = $derived(activeTab !== 'overall' 
    ? TABS.filter(t => t !== activeTab).concat([activeTab])
    : TABS);

  function getCurrentData(tab, filter) {
    if (tab === 'overall') {
      return genderData.overall;
    } else if (tab === 'alliance') {
      return genderData.byAlliance[filter] || { male: 0, female: 0, transgender: 0, unknown: 0 };
    } else if (tab === 'party') {
      return genderData.byParty[filter] || { male: 0, female: 0, transgender: 0, unknown: 0 };
    } else if (tab === 'district') {
      return genderData.byDistrict[filter] || { male: 0, female: 0, transgender: 0, unknown: 0 };
    }
    return genderData.overall;
  }

  function setTab(tab) {
    activeTab = tab;
    if (tab === 'overall') {
      activeFilter = 'overall';
    } else if (tab === 'alliance') {
      activeFilter = 'LDF';
    } else if (tab === 'party') {
      activeFilter = Object.keys(genderData.byParty)[0] || '';
    } else if (tab === 'district') {
      activeFilter = getFilterOptions('district')[0] || '';
    }
  }

  function renderStackedBar() {
    if (!chartContainer) return;

    if (!chart) {
      chart = echarts.init(chartContainer, null, { renderer: 'svg' });
    }

    const series = [
      {
        type: 'bar',
        stack: 'total',
        data: [{ value: femaleCount, itemStyle: { color: '#EC4899' } }],
        barWidth: '100%',
        label: { show: false }
      }
    ];

    if (showTransgender) {
      series.push({
        type: 'bar',
        stack: 'total',
        data: [{ value: transCount, itemStyle: { color: '#8B5CF6' } }],
        barWidth: '100%',
        label: { show: false }
      });
    }

    series.push({
      type: 'bar',
      stack: 'total',
      data: [{ value: maleCount, itemStyle: { color: '#3B82F6' } }],
      barWidth: '100%',
      label: { show: false }
    });

    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 0, right: 0, top: 0, bottom: 0, containLabel: false },
      xAxis: { type: 'value', show: false, min: 0, max: totalCount },
      yAxis: { type: 'category', show: false },
      series
    };

    chart.setOption(option);
  }

  function getFilterOptions(tab) {
    if (tab === 'alliance') {
      return ALLIANCES;
    } else if (tab === 'party') {
      return Object.keys(genderData.byParty);
    } else if (tab === 'district') {
      const districts = Object.keys(genderData.byDistrict);
      return districts.sort((a, b) => {
        const idxA = KERALA_DISTRICTS.indexOf(a);
        const idxB = KERALA_DISTRICTS.indexOf(b);
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }
    return [];
  }

  function getCurrentIndex() {
    const options = getFilterOptions(activeTab);
    return options.indexOf(activeFilter);
  }

  function navigatePrev() {
    const options = getFilterOptions(activeTab);
    const idx = getCurrentIndex();
    if (idx > 0) {
      activeFilter = options[idx - 1];
    }
  }

  function navigateNext() {
    const options = getFilterOptions(activeTab);
    const idx = getCurrentIndex();
    if (idx < options.length - 1) {
      activeFilter = options[idx + 1];
    }
  }

  function initChart() {
    if (!chartContainer) return;
    
    if (!chart) {
      chart = echarts.init(chartContainer, null, { renderer: 'svg' });
    }

    resizeObserver = new ResizeObserver(() => {
      if (chart) chart.resize();
    });
    resizeObserver.observe(chartContainer);

    renderStackedBar();
  }

  function disposeChart() {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (chart) {
      chart.dispose();
      chart = null;
    }
  }

  $effect(() => {
    if (isActive) {
      setTimeout(() => initChart(), 50);
    }
    return () => disposeChart();
  });

  $effect(() => {
    if (chart && totalCount >= 0) {
      renderStackedBar();
    }
  });
</script>

<div class="gender-dist">
  <div class="tab-bar">
    <div class="tabs">
      {#each tabsWithFloat as tab}
        <button 
          class="tab-btn" 
          class:active={activeTab === tab}
          onclick={() => setTab(tab)}
        >
          {getTabLabel(tab)}
        </button>
      {/each}
    </div>
    {#if activeTab !== 'overall'}
      <div class="filter-nav">
        <button 
          class="nav-btn" 
          onclick={navigatePrev}
          disabled={getCurrentIndex() <= 0}
        >←</button>
        <select 
          class="filter-select"
          bind:value={activeFilter}
        >
          {#each getFilterOptions(activeTab) as opt}
            <option value={opt}>{opt}</option>
          {/each}
        </select>
        <button 
          class="nav-btn" 
          onclick={navigateNext}
          disabled={getCurrentIndex() >= getFilterOptions(activeTab).length - 1}
        >→</button>
      </div>
    {/if}
  </div>

  <div class="cards-row" class:has-trans={showTransgender}>
    <div class="gender-card female">
      <div class="card-icon">♀</div>
      <div class="card-count">{femaleCount}</div>
      <div class="card-label">{$_('charts.women')}</div>
      <div class="card-pct">{femalePct}%</div>
    </div>
    {#if showTransgender}
      <div class="gender-card trans">
        <div class="card-icon">⚥</div>
        <div class="card-count">{transCount}</div>
        <div class="card-label">{$_('charts.transgender')}</div>
        <div class="card-pct">{transPct}%</div>
      </div>
    {/if}
    <div class="gender-card male">
      <div class="card-icon">♂</div>
      <div class="card-count">{maleCount}</div>
      <div class="card-label">{$_('charts.men')}</div>
      <div class="card-pct">{malePct}%</div>
    </div>
  </div>

  <div class="stacked-bar-container">
    <div class="stacked-bar" bind:this={chartContainer}></div>
    <div class="bar-legend">
      <span class="legend-item"><span class="legend-dot female"></span> {$_('charts.women')} ({femalePct}%)</span>
      {#if showTransgender}
        <span class="legend-item"><span class="legend-dot trans"></span> {$_('charts.transgender')} ({transPct}%)</span>
      {/if}
      <span class="legend-item"><span class="legend-dot male"></span> {$_('charts.men')} ({malePct}%)</span>
    </div>
  </div>
</div>

<style>
  .gender-dist {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tab-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .tabs {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    position: relative;
  }

  .tab-btn {
    padding: 8px 16px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .tab-btn:hover {
    border-color: var(--gold-mid);
    color: var(--text-soft);
  }

  .tab-btn.active {
    background: var(--gold-light);
    border-color: var(--gold-mid);
    color: var(--gold);
  }

  .filter-select {
    padding: 8px 12px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: var(--text);
    min-width: 150px;
    cursor: pointer;
  }

  .filter-nav {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .nav-btn {
    padding: 6px 10px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 4px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: var(--text-soft);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .nav-btn:hover:not(:disabled) {
    border-color: var(--gold-mid);
    color: var(--gold);
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .cards-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .cards-row.has-trans {
    grid-template-columns: repeat(3, 1fr);
  }

  .gender-card {
    padding: 24px 16px;
    border-radius: 12px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .gender-card.female {
    background: #FCE7F3;
    border: 1px solid #F9A8D4;
  }

  .gender-card.male {
    background: #DBEAFE;
    border: 1px solid #93C5FD;
  }

  .gender-card.trans {
    background: #EDE9FE;
    border: 1px solid #C4B5FD;
  }

  .card-icon {
    font-size: 28px;
    line-height: 1;
  }

  .gender-card.female .card-icon { color: #EC4899; }
  .gender-card.male .card-icon { color: #3B82F6; }
  .gender-card.trans .card-icon { color: #8B5CF6; }

  .card-count {
    font-family: 'Inter', sans-serif;
    font-size: 36px;
    font-weight: 700;
    line-height: 1;
    margin-top: 8px;
  }

  .gender-card.female .card-count { color: #BE185D; }
  .gender-card.male .card-count { color: #1D4ED8; }
  .gender-card.trans .card-count { color: #7C3AED; }

  .card-label {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .gender-card.female .card-label { color: #9D174D; }
  .gender-card.male .card-label { color: #1E40AF; }
  .gender-card.trans .card-label { color: #6D28D9; }

  .card-pct {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
  }

  .stacked-bar-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .stacked-bar {
    width: 100%;
    height: 24px;
    border-radius: 4px;
    overflow: hidden;
    min-width: 0;
  }

  .bar-legend {
    display: flex;
    gap: 16px;
    justify-content: center;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--muted);
  }

  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .legend-dot.female { background: #EC4899; }
  .legend-dot.male { background: #3B82F6; }
  .legend-dot.trans { background: #8B5CF6; }

  @media (max-width: 640px) {
    .cards-row {
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    .cards-row.has-trans {
      grid-template-columns: repeat(2, 1fr);
    }
    .gender-card {
      padding: 16px 8px;
    }
    .card-value {
      font-size: var(--fs-2xl);
    }
  }
</style>