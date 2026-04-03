<script>
  import { onMount } from 'svelte';
  import * as echarts from 'echarts/core';
  import { LineChart } from 'echarts/charts';
  import {
    TooltipComponent,
    GridComponent,
    LegendComponent
  } from 'echarts/components';
  import { SVGRenderer } from 'echarts/renderers';

  echarts.use([
    LineChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    SVGRenderer
  ]);
  import { _ } from '../../lib/i18n.js';

  let { niyamasabhaData = [], loksabhaData = [], onUnmerge = null } = $props();

  const COLORS = {
    LDF: '#D94040',
    UDF: '#1565C0',
    NDA: '#E07828',
    Others: '#33AA55'
  };

  const ALLIANCES = ['LDF', 'UDF', 'NDA', 'Others'];

  let chartContainer = $state(null);
  let chart = null;

  let combinedData = $derived.by(() => {
    const ns = [...niyamasabhaData];
    const ls = [...loksabhaData];
    
    const merged = [];
    
    ns.forEach(d => {
      merged.push({
        year: d.year,
        type: 'N',
        winner: d.winner,
        runnerUp: d.runnerUp,
        allianceVotes: d.allianceVotes,
        totalVotes: d.totalVotes
      });
    });
    
    ls.forEach(d => {
      merged.push({
        year: d.year,
        type: 'L',
        winner: d.winner,
        runnerUp: d.runnerUp,
        allianceVotes: d.allianceVotes,
        totalVotes: d.totalVotes
      });
    });
    
    return merged.sort((a, b) => parseInt(a.year) - parseInt(b.year));
  });

  let hasData = $derived(combinedData.length > 0);

  $effect(() => {
    if (chartContainer && hasData) {
      renderChart();
    }
  });

  onMount(() => {
    return () => { if (chart) chart.dispose(); };
  });

  function renderChart() {
    if (!chartContainer || !hasData) return;
    
    if (chart) {
      chart.dispose();
      chart = null;
    }
    chart = echarts.init(chartContainer, null, { renderer: 'svg' });

    const series = ALLIANCES
      .filter(al => combinedData.some(d => d.allianceVotes[al] > 0))
      .map(al => ({
        name: al,
        type: 'line',
        smooth: false,
        symbol: (value, params) => params.data?.type === 'N' ? 'rect' : 'circle',
        symbolSize: 9,
        animationDuration: 2000,
        data: combinedData.map(d => {
          const allianceVotes = d.allianceVotes[al] || 0;
          const pct = d.totalVotes > 0 ? (allianceVotes / d.totalVotes) * 100 : 0;
          let candidateName = '';
          let candidateParty = '';
          let candidateVotes = allianceVotes;
          
          if (d.winner?.alliance === al) {
            candidateName = d.winner.name || '';
            candidateParty = d.winner.party || '';
            candidateVotes = d.winner.votes || 0;
          } else if (d.runnerUp?.alliance === al) {
            candidateName = d.runnerUp.name || '';
            candidateParty = d.runnerUp.party || '';
            candidateVotes = d.runnerUp.votes || 0;
          }
          
          return {
            value: parseFloat(pct.toFixed(1)),
            candidate: candidateName,
            party: candidateParty,
            votes: candidateVotes,
            type: d.type,
            year: d.year
          };
        }),
        itemStyle: { color: COLORS[al] },
        label: {
          show: true,
          formatter: (p) => p.value > 3 ? p.value + '%' : '',
          color: COLORS[al],
          fontSize: 10,
          fontWeight: 600,
          position: 'top'
        },
        lineStyle: { width: 3 },
        areaStyle: {
          opacity: 0.15
        }
      }));

    const xLabels = combinedData.map(d => `${d.year}${d.type === 'N' ? ' AC' : ' PC'}`);

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        confine: true,
        formatter: (params) => {
          const item = params[0];
          const yearData = combinedData[item.dataIndex];
          const typeLabel = yearData.type === 'N' ? 'Assembly (AC)' : 'Parliament (PC)';
          let html = `<strong>${yearData.year} (${typeLabel})</strong><br/>`;
          params.forEach(p => {
            const dataItem = p.data;
            html += `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: ${p.value}% (${dataItem.votes.toLocaleString()} votes)<br/>`;
            if (dataItem.candidate && dataItem.party) {
              html += `<span style="margin-left:16px;font-size:10px;color:#666">${dataItem.candidate} (${dataItem.party})</span><br/>`;
            }
          });
          return html;
        }
      },
      legend: { data: ALLIANCES, bottom: 0, textStyle: { fontSize: 10 } },
      grid: { left: 44, right: 16, top: 24, bottom: 56 },
      xAxis: { 
        type: 'category', 
        data: xLabels,
        axisLabel: { fontWeight: 600, fontSize: 10 }
      },
      yAxis: { 
        type: 'value', 
        axisLabel: { formatter: (v) => v + '%' }
      },
      series
    }, { notMerge: true });
  }
</script>

<div class="bothsabha-container">
  <div class="bothsabha-header">
    <div class="bothsabha-title">{$_('charts.bothsabhaTitle')}</div>
    <div class="bothsabha-subtitle">{$_('charts.bothsabhaSubtitle')}</div>
  </div>

  {#if hasData}
    <div class="chart-view" bind:this={chartContainer}></div>
    <div class="type-legend">
      <span class="type-item"><span class="type-symbol rect"></span> Assembly (AC)</span>
      <span class="type-item"><span class="type-symbol circle"></span> Parliament (PC)</span>
    </div>
    {#if onUnmerge}
      <button class="unmerge-btn" onclick={onUnmerge}>{$_('charts.unmergeResults')}</button>
    {/if}
  {:else}
    <div class="pending-box">
      <div class="pending-text">
        No combined data available
      </div>
    </div>
  {/if}
</div>

<style>
  .bothsabha-container {
    margin-top: 8px;
  }

  .bothsabha-header {
    margin-bottom: 8px;
  }

  .bothsabha-title {
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    font-weight: 700;
    color: var(--text);
    letter-spacing: 0.05em;
  }

  .bothsabha-subtitle {
    font-family: 'Manjari', monospace;
    font-size: 10px;
    color: var(--muted);
    margin-top: 2px;
  }

  .type-legend {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-bottom: 8px;
  }

  .type-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Manjari', monospace;
    font-size: 10px;
    color: var(--muted);
  }

  .type-symbol {
    width: 10px;
    height: 10px;
    display: inline-block;
  }

  .type-symbol.rect {
    background: #000;
  }

  .type-symbol.circle {
    background: #000;
    border-radius: 50%;
  }

  .chart-view {
    width: 100%;
    height: 300px;
  }

  .unmerge-btn {
    margin-top: 16px;
    font-family: 'Manjari', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    padding: 8px 16px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.18s;
    display: block;
    width: 100%;
  }

  .unmerge-btn:hover {
    border-color: var(--text);
    color: var(--text);
  }

  .pending-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 24px 16px;
    background: var(--card2);
    border: 1px dashed var(--border);
    border-radius: 8px;
    text-align: center;
  }

  .pending-text {
    font-family: 'Manjari', monospace;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.05em;
  }
</style>
