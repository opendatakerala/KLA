<script>
  import { onMount } from 'svelte';
  import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  SVGRenderer
]);
  import ageData from '../../data/age-distribution.json';
  import { _ } from '../../lib/i18n.js';
  import { KERALA_DISTRICTS } from '../../lib/constants.js';

  const { isActive = false } = $props();

  const TABS = ['overall', 'alliance', 'party', 'district'];
  function getTabLabel(tab) {
    return $_(`charts.${tab}`);
  }

  let tabsWithFloat = $derived(activeTab !== 'overall' 
    ? TABS.filter(t => t !== activeTab).concat([activeTab])
    : TABS);

  const ALLIANCES = ['LDF', 'UDF', 'NDA', 'Others'];
  const ALLIANCE_COLORS = {
    LDF: '#E53935',
    UDF: '#1E88E5',
    NDA: '#FB8C00',
    Others: '#757575',
    Overall: '#10B981'
  };

  const AGE_BINS = ['25-39', '40-49', '50-59', '60-69', '70-79', '80+'];
  const AGE_COLORS = {
    '25-39': '#34D399',
    '40-49': '#A3E635',
    '50-59': '#FACC15',
    '60-69': '#FB923C',
    '70-79': '#F87171',
    '80+': '#C084FC'
  };

  function getBins(data) {
    const { average, ...bins } = data;
    return bins;
  }

  let avgAges = $derived({
    Overall: ageData.overall?.average || 0,
    LDF: ageData.byAlliance['LDF']?.average || 0,
    UDF: ageData.byAlliance['UDF']?.average || 0,
    NDA: ageData.byAlliance['NDA']?.average || 0
  });

  let activeTab = $state('overall');
  let activeFilter = $state('overall');
  let prevTab = $state('overall');
  let chartContainer = $state(null);
  let chart = $state(null);
  let resizeObserver = $state(null);
  let needsClear = $state(false);

  function getCurrentData(tab, filter) {
    if (tab === 'overall') {
      return getBins(ageData.overall);
    } else if (tab === 'alliance') {
      return getBins(ageData.byAlliance[filter] || {});
    } else if (tab === 'party') {
      return getBins(ageData.byParty[filter] || {});
    } else if (tab === 'district') {
      return getBins(ageData.byDistrict[filter] || {});
    }
    return getBins(ageData.overall);
  }

  function getCurrentAverage(tab, filter) {
    if (tab === 'overall') {
      return ageData.overall.average || 0;
    } else if (tab === 'alliance') {
      return ageData.byAlliance[filter]?.average || 0;
    } else if (tab === 'party') {
      return ageData.byParty[filter]?.average || 0;
    } else if (tab === 'district') {
      return ageData.byDistrict[filter]?.average || 0;
    }
    return 0;
  }

  let currentAverage = $derived(getCurrentAverage(activeTab, activeFilter));

  function getCompareData() {
    const result = {};
    AGE_BINS.forEach(bin => {
      result[bin] = {
        LDF: ageData.byAlliance['LDF']?.[bin] || 0,
        UDF: ageData.byAlliance['UDF']?.[bin] || 0,
        NDA: ageData.byAlliance['NDA']?.[bin] || 0
      };
    });
    return result;
  }

  function setTab(tab) {
    const wasOverall = activeTab === 'overall';
    const isOverall = tab === 'overall';
    if (wasOverall !== isOverall) {
      needsClear = true;
    }
    activeTab = tab;
    if (tab === 'overall') {
      activeFilter = 'overall';
    } else if (tab === 'alliance') {
      activeFilter = 'LDF';
    } else if (tab === 'party') {
      activeFilter = Object.keys(ageData.byParty)[0] || '';
    } else if (tab === 'district') {
      activeFilter = getFilterOptions('district')[0] || '';
    }
  }

  function getFilterOptions(tab) {
    if (tab === 'alliance') {
      return ALLIANCES;
    } else if (tab === 'party') {
      return Object.keys(ageData.byParty);
    } else if (tab === 'district') {
      const districts = Object.keys(ageData.byDistrict);
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

  function calculateTotal(data) {
    return Object.values(data).reduce((sum, val) => sum + val, 0);
  }

  function renderChart() {
    if (!chartContainer || !chart) return;

    if (needsClear) {
      chart.clear();
      needsClear = false;
    }

    if (activeTab === 'overall') {
      const compareData = getCompareData();
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['LDF', 'UDF', 'NDA'],
          top: 0,
          textStyle: { fontFamily: 'Manjari', fontSize: 11 }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: 40,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: AGE_BINS,
          axisLabel: { fontFamily: 'Manjari', fontSize: 11 }
        },
        yAxis: {
          type: 'value',
          axisLabel: { fontFamily: 'Manjari', fontSize: 11 }
        },
        series: [
          {
            name: 'LDF',
            type: 'bar',
            data: AGE_BINS.map(bin => compareData[bin].LDF),
            itemStyle: { color: ALLIANCE_COLORS.LDF }
          },
          {
            name: 'UDF',
            type: 'bar',
            data: AGE_BINS.map(bin => compareData[bin].UDF),
            itemStyle: { color: ALLIANCE_COLORS.UDF }
          },
          {
            name: 'NDA',
            type: 'bar',
            data: AGE_BINS.map(bin => compareData[bin].NDA),
            itemStyle: { color: ALLIANCE_COLORS.NDA }
          }
        ]
      };
      chart.setOption(option);
    } else {
      const currentData = getCurrentData(activeTab, activeFilter);
      const total = calculateTotal(currentData);
      
      const seriesData = AGE_BINS.map(bin => ({
        name: bin,
        value: currentData[bin] || 0,
        itemStyle: { color: AGE_COLORS[bin] }
      }));

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params) => {
            const p = params[0];
            const pct = total > 0 ? ((p.value / total) * 100).toFixed(1) : 0;
            return `${p.name}<br/>Count: ${p.value} (${pct}%)`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: 10,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: AGE_BINS,
          axisLabel: { fontFamily: 'Manjari', fontSize: 11 }
        },
        yAxis: {
          type: 'value',
          axisLabel: { fontFamily: 'Manjari', fontSize: 11 }
        },
        series: [{
          type: 'bar',
          data: seriesData,
          barWidth: '60%'
        }]
      };
      chart.setOption(option);
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

    renderChart();
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
    if (chart && activeTab) {
      renderChart();
    }
  });
</script>

<div class="age-dist">
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

  {#if activeTab === 'overall'}
    <div class="avg-label-row">{$_('charts.averageAge')}</div>
    <div class="avg-ages">
      <div class="avg-card" style="--card-color: {ALLIANCE_COLORS.Overall}">
        <span class="avg-label">Overall</span>
        <span class="avg-value">{avgAges.Overall}</span>
        <span class="avg-unit">yrs</span>
      </div>
      <div class="avg-card" style="--card-color: {ALLIANCE_COLORS.LDF}">
        <span class="avg-label">LDF</span>
        <span class="avg-value">{avgAges.LDF}</span>
        <span class="avg-unit">yrs</span>
      </div>
      <div class="avg-card" style="--card-color: {ALLIANCE_COLORS.UDF}">
        <span class="avg-label">UDF</span>
        <span class="avg-value">{avgAges.UDF}</span>
        <span class="avg-unit">yrs</span>
      </div>
      <div class="avg-card" style="--card-color: {ALLIANCE_COLORS.NDA}">
        <span class="avg-label">NDA</span>
        <span class="avg-value">{avgAges.NDA}</span>
        <span class="avg-unit">yrs</span>
      </div>
    </div>
  {:else}
    <div class="avg-ages">
      <div class="avg-header-card">
        <span class="avg-label">{$_('charts.averageAge')}</span>
        <span class="avg-value">{currentAverage}</span>
        <span class="avg-unit">yrs</span>
      </div>
    </div>
  {/if}

  <div class="chart-container" bind:this={chartContainer}></div>
</div>

<style>
  .age-dist {
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
    font-family: 'Manjari', monospace;
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
    font-family: 'Manjari', sans-serif;
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
    font-family: 'Manjari', monospace;
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

  .chart-container {
    width: 100%;
    height: 320px;
  }

  .avg-label-row {
    font-family: 'Manjari', monospace;
    font-size: 11px;
    color: var(--muted);
    text-align: center;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .avg-ages {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .avg-header-card {
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding: 12px 20px;
    background: linear-gradient(135deg, var(--gold-mid) 0%, var(--gold) 100%);
    border: 1px solid var(--gold);
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(234, 179, 8, 0.3);
  }

  .avg-card {
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding: 12px 20px;
    background: var(--card2);
    border: 1px solid var(--card-color);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .avg-label {
    font-family: 'Manjari', monospace;
    font-size: 12px;
    font-weight: 600;
    color: var(--card-color);
    letter-spacing: 0.05em;
  }

  .avg-header-card .avg-label {
    color: #fff;
  }

  .avg-value {
    font-family: 'Manjari', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: var(--card-color);
    line-height: 1;
  }

  .avg-header-card .avg-value {
    color: #fff;
  }

  .avg-unit {
    font-family: 'Manjari', monospace;
    font-size: 11px;
    color: var(--muted);
  }

  .avg-header-card .avg-unit {
    color: rgba(255, 255, 255, 0.8);
  }
</style>
