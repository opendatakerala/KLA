<script>
  import { onMount } from 'svelte';
  import * as echarts from 'echarts/core';
  import { BarChart } from 'echarts/charts';
  import {
    TooltipComponent,
    GridComponent
  } from 'echarts/components';
  import { SVGRenderer } from 'echarts/renderers';

  echarts.use([
    BarChart,
    GridComponent,
    TooltipComponent,
    SVGRenderer
  ]);
  import educationData from '../../data/education-distribution.json';
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

  const EDU_ORDER = ['UP', 'High School', 'Higher Secondary', 'Diploma', 'Degree', 'Professional Degree', 'Master Degree', 'Doctorate Degree', 'Post Doctorate'];
  const EDU_COLORS = ['#9CA3AF', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F87171', '#EC4899', '#8B5CF6', '#10B981'];

  function getSortedEduData(tab, filter) {
    let data;
    if (tab === 'overall') {
      data = educationData.overall;
    } else if (tab === 'alliance') {
      data = educationData.byAlliance[filter] || {};
    } else if (tab === 'party') {
      data = educationData.byParty[filter] || {};
    } else if (tab === 'district') {
      data = educationData.byDistrict[filter] || {};
    }
    
    const entries = Object.entries(data || {}).filter(([k, v]) => v > 0);
    entries.sort((a, b) => a[1] - b[1]);
    return entries;
  }

  let currentData = $derived(getSortedEduData(activeTab, activeFilter));
  let totalCount = $derived(currentData.reduce((sum, [, v]) => sum + v, 0));

  let tabsWithFloat = $derived(activeTab !== 'overall' 
    ? TABS.filter(t => t !== activeTab).concat([activeTab])
    : TABS);

  function setTab(tab) {
    activeTab = tab;
    if (tab === 'overall') {
      activeFilter = 'overall';
    } else if (tab === 'alliance') {
      activeFilter = 'LDF';
    } else if (tab === 'party') {
      activeFilter = Object.keys(educationData.byParty)[0] || '';
    } else if (tab === 'district') {
      activeFilter = getFilterOptions('district')[0] || '';
    }
  }

  function renderChart() {
    if (!chartContainer) return;

    if (!chart) {
      chart = echarts.init(chartContainer, null, { renderer: 'svg' });
    }

    const categories = currentData.map(([edu]) => edu);
    const values = currentData.map(([, count]) => count);
    const colors = currentData.map(([edu]) => {
      const idx = EDU_ORDER.indexOf(edu);
      return EDU_COLORS[idx] || '#9CA3AF';
    });

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        confine: true,
        formatter: (params) => {
          const p = params[0];
          const pct = totalCount > 0 ? ((p.value / totalCount) * 100).toFixed(1) : 0;
          return `${p.name}<br/>${p.value} (${pct}%)`;
        }
      },
      grid: { left: 120, right: 40, top: 10, bottom: 10, containLabel: false },
      xAxis: { type: 'value', show: false, min: 0, max: totalCount },
      yAxis: { 
        type: 'category', 
        data: categories, 
        show: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: '#6B7280',
          fontFamily: 'Manjari',
          fontSize: 11
        }
      },
      series: [{
        type: 'bar',
        data: values.map((v, i) => ({ value: v, itemStyle: { color: colors[i] } })),
        barWidth: '60%',
        label: { 
          show: true,
          position: 'right',
          formatter: (p) => p.value,
          color: '#374151',
          fontFamily: 'Manjari',
          fontSize: 11
        }
      }]
    };

    chart.setOption(option);
  }

  function getFilterOptions(tab) {
    if (tab === 'alliance') {
      return ALLIANCES;
    } else if (tab === 'party') {
      return Object.keys(educationData.byParty);
    } else if (tab === 'district') {
      const districts = Object.keys(educationData.byDistrict);
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
    if (chart && currentData) {
      renderChart();
    }
  });
</script>

<div class="edu-dist">
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

  <div class="total-badge">
    <span class="total-label">{$_('charts.candidates')}:</span>
    <span class="total-count">{totalCount}</span>
  </div>

  <div class="bar-chart-container">
    <div class="bar-chart" bind:this={chartContainer}></div>
  </div>
</div>

<style>
  .edu-dist {
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

  .total-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    padding: 12px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .total-label {
    font-family: 'Manjari', monospace;
    font-size: 13px;
    color: var(--muted);
  }

  .total-count {
    font-family: 'Manjari', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--gold);
  }

  .bar-chart-container {
    width: 100%;
    min-height: 300px;
  }

  .bar-chart {
    width: 100%;
    height: 300px;
  }

  @media (max-width: 640px) {
    .bar-chart-container {
      overflow-x: auto;
    }
    .bar-chart {
      min-width: 300px;
    }
  }
</style>
