<script>
  import { onMount } from 'svelte';
  import { selectedConstituency } from '../../stores/constituencyStore.js';
  import { getHistoricalData } from '../../stores/historicalStore.js';
  import * as echarts from 'echarts';
  
  const STORAGE_KEY = 'historicalViewMode';
  const COLORS = {
    LDF: '#D94040',
    UDF: '#1565C0',
    NDA: '#E07828',
    Others: '#33AA55'
  };
  
  const ALLIANCES = ['LDF', 'UDF', 'NDA', 'Others'];
  
  let currentView = 'bars';
  let chartContainer;
  let chart = null;
  
  $: qid = $selectedConstituency?.qid;
  $: seriesData = qid ? getHistoricalData(qid) : [];
  
  onMount(() => {
    currentView = localStorage.getItem(STORAGE_KEY) || 'bars';
    
    return () => {
      if (chart) chart.dispose();
    };
  });
  
  function setView(view) {
    currentView = view;
    localStorage.setItem(STORAGE_KEY, view);
    
    if ((view === 'line' || view === 'stacked') && chartContainer && seriesData.length > 0) {
      setTimeout(renderChart, 0);
    }
  }
  
  function renderChart() {
    if (!chartContainer || seriesData.length === 0) return;
    
    if (chart) {
      chart.dispose();
      chart = null;
    }
    
    chart = echarts.init(chartContainer, null, { renderer: 'svg' });
    
    let series;
    
    if (currentView === 'line') {
      series = ALLIANCES.map(alliance => ({
        name: alliance,
        type: 'line',
        data: seriesData.map(d => {
          const pct = d.totalVotes > 0 ? (d.allianceVotes[alliance] / d.totalVotes) * 100 : 0;
          return parseFloat(pct.toFixed(1));
        }),
        smooth: true,
        itemStyle: { color: COLORS[alliance] },
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 8
      }));
    } else if (currentView === 'stacked') {
      series = ALLIANCES
        .filter(alliance => seriesData.some(d => d.allianceVotes[alliance] > 0))
        .map(alliance => ({
          name: alliance,
          type: 'bar',
          stack: 'total',
          data: seriesData.map(d => {
            const pct = d.totalVotes > 0 ? (d.allianceVotes[alliance] / d.totalVotes) * 100 : 0;
            return parseFloat(pct.toFixed(1));
          }),
          itemStyle: { color: COLORS[alliance] }
        }));
    }
    
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ALLIANCES, bottom: 0 },
      grid: { left: 40, right: 20, top: 20, bottom: 50 },
      xAxis: { type: 'category', data: seriesData.map(d => d.year) },
      yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      series
    };
    
    chart.setOption(option);
  }
  
  function getPct(votes, total) {
    return total > 0 ? ((votes / total) * 100).toFixed(1) : '0.0';
  }
</script>

{#if seriesData.length > 0}
  <div class="historical-chart-container">
    <div class="historical-switcher">
      <button 
        class="hist-switch-btn" 
        class:active={currentView === 'bars'}
        on:click={() => setView('bars')}
      >
        Bars
      </button>
      <button 
        class="hist-switch-btn" 
        class:active={currentView === 'line'}
        on:click={() => setView('line')}
      >
        Line
      </button>
      <button 
        class="hist-switch-btn" 
        class:active={currentView === 'stacked'}
        on:click={() => setView('stacked')}
      >
        Stacked
      </button>
    </div>
    
    {#if currentView === 'bars'}
      <div class="bars-view">
        {#each seriesData as yearData}
          <div class="year-group">
            <div class="year-label">{yearData.year}</div>
            <div class="bars-container">
              {#each ALLIANCES as alliance}
                {#if yearData.allianceVotes[alliance] > 0}
                  <div class="bar-row">
                    <span class="alliance-label" style="color: {COLORS[alliance]}">{alliance}</span>
                    <div class="bar-track">
                      <div 
                        class="bar-fill" 
                        style="width: {getPct(yearData.allianceVotes[alliance], yearData.totalVotes)}%; background: {COLORS[alliance]}"
                      ></div>
                    </div>
                    <span class="pct-label">{getPct(yearData.allianceVotes[alliance], yearData.totalVotes)}%</span>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="chart-view" bind:this={chartContainer}></div>
    {/if}
  </div>
{/if}

<style>
  .historical-chart-container {
    margin-top: 24px;
  }

  .historical-switcher {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .hist-switch-btn {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    padding: 6px 12px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.18s;
  }

  .hist-switch-btn:hover {
    border-color: var(--text);
    color: var(--text);
  }

  .hist-switch-btn.active {
    background: var(--text);
    color: var(--card);
    border-color: var(--text);
  }

  .bars-view {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .year-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .year-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  .bars-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .bar-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .alliance-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    font-weight: 600;
    width: 32px;
  }

  .bar-track {
    flex: 1;
    height: 6px;
    background: var(--card2);
    border-radius: 3px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .pct-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    color: var(--muted);
    width: 36px;
    text-align: right;
  }

  .chart-view {
    width: 100%;
    height: 250px;
  }
</style>