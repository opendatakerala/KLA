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
  import candidatesByParty from '../../data/candidates-by-party.json';
  import { getPartyColor, ALLIANCE_COLORS } from '../../lib/constants.js';

  const { isActive = false } = $props();

  const ALLIANCES = ['LDF', 'UDF', 'NDA', 'Others'];
  const ALLIANCE_LABELS = { LDF: 'LDF', UDF: 'UDF', NDA: 'NDA', Others: 'Others' };
  const ROW_HEIGHT = 20;

  let charts = $state({});
  let resizeObserver = null;

  function renderChart(alliance, container, isMobile = false) {
    if (!container) return;

    const parties = candidatesByParty[alliance] || {};
    const data = Object.entries(parties)
      .sort((a, b) => a[1] - b[1])
      .map(([name, count]) => ({
        name,
        value: count,
        itemStyle: { color: getPartyColor(name) }
      }));

    const height = Math.max(180, data.length * ROW_HEIGHT + 20);
    container.style.height = `${height}px`;

    if (!charts[alliance]) {
      charts[alliance] = echarts.init(container, null, { renderer: 'svg' });
    }
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: '{b}: {c} candidates'
      },
      grid: { left: 4, right: isMobile ? 60 : 120, top: 4, bottom: 4, containLabel: false },
      xAxis: { 
        type: 'value',
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      },
      yAxis: { 
        type: 'category',
        data: data.map(d => d.name),
        axisLabel: { show: false },
        axisTick: { show: false },
        axisLine: { show: false }
      },
      series: [{
        type: 'bar',
        data: data,
        barWidth: '60%',
        label: {
          show: true,
          position: 'right',
          fontFamily: 'Manjari',
          fontSize: 10,
          color: '#111827',
          formatter: '{b} ({c})'
        }
      }]
    };

    charts[alliance].setOption(option);
  }

  function initCharts() {
    const checkMobile = () => window.innerWidth <= 768;
    const isMobile = checkMobile();
    
    ALLIANCES.forEach(alliance => {
      const container = document.getElementById(`party-chart-${alliance.toLowerCase()}`);
      renderChart(alliance, container, isMobile);
    });

    resizeObserver = new ResizeObserver(() => {
      Object.values(charts).forEach(chart => chart.resize());
    });

    ALLIANCES.forEach(alliance => {
      const container = document.getElementById(`party-chart-${alliance.toLowerCase()}`);
      if (container) resizeObserver.observe(container);
    });
  }

  function disposeCharts() {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    Object.values(charts).forEach(chart => chart.dispose());
    charts = {};
  }

  $effect(() => {
    if (isActive) {
      initCharts();
    }
    return () => {
      disposeCharts();
    };
  });
</script>

<div class="party-dist" id="party-dist">
  {#each ALLIANCES as alliance}
    <div class="party-alliance">
      <div class="alliance-label" style="color: {ALLIANCE_COLORS[alliance]}">
        {ALLIANCE_LABELS[alliance]}
      </div>
      <div class="chart-container" id="party-chart-{alliance.toLowerCase()}"></div>
    </div>
  {/each}
</div>

<style>
  .party-dist {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  @media (max-width: 768px) {
    .party-dist {
      grid-template-columns: 1fr;
    }
  }

  .party-alliance {
    padding: 16px;
    background: var(--card2);
    border-radius: 8px;
  }

  .alliance-label {
    font-family: 'Manjari', monospace;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.1em;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .chart-container {
    width: 100%;
    min-height: 180px;
  }
</style>