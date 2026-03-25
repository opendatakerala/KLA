<script>
  import { onMount } from 'svelte';
  
  export let seriesData = [];
  
  const STORAGE_KEY = 'historicalViewMode';
  const COLORS = {
    LDF: '#D94040',
    UDF: '#1565C0',
    NDA: '#E07828',
    Others: '#33AA55'
  };
  
  let currentView = 'bars';
  let chart = null;
  let chartContainer;
  
  onMount(() => {
    currentView = localStorage.getItem(STORAGE_KEY) || 'bars';
    if (seriesData.length > 0) {
      render();
    }
    
    return () => {
      if (chart) chart.dispose();
    };
  });
  
  function setView(view) {
    currentView = view;
    localStorage.setItem(STORAGE_KEY, view);
    render();
  }
  
  function render() {
    if (!chartContainer || seriesData.length === 0) return;
    
    if (chart) {
      chart.dispose();
      chart = null;
    }
    
    if (currentView === 'bars') {
      renderBars();
    } else if (currentView === 'line') {
      renderLine();
    } else if (currentView === 'stacked') {
      renderStacked();
    }
  }
  
  function renderBars() {
    const content = document.getElementById('historical-content');
    if (!content) return;
    
    content.style.display = 'block';
    chartContainer.style.display = 'none';
    
    let html = '<div class="modal-historical">';
    seriesData.forEach(d => {
      html += `<div class="historical-year"><div class="historical-year-label">${d.year}</div>`;
      ['LDF', 'UDF', 'NDA', 'Others'].forEach(al => {
        if (d.allianceVotes[al] > 0) {
          const pct = d.totalVotes > 0 ? ((d.allianceVotes[al] / d.totalVotes) * 100).toFixed(1) : 0;
          html += `<div class="historical-bar"><span class="historical-alliance ${al}">${al}</span><div class="historical-bar-track"><div class="historical-bar-fill" style="width:${pct}%;background:${COLORS[al]}"></div></div><span class="historical-pct">${pct}%</span></div>`;
        }
      });
      html += '</div>';
    });
    html += '</div>';
    content.innerHTML = html;
  }
  
  async function renderLine() {
    const echarts = await import('echarts');
    const content = document.getElementById('historical-content');
    if (!content) return;
    
    content.style.display = 'none';
    chartContainer.style.display = 'block';
    
    chart = echarts.init(chartContainer, null, { renderer: 'svg' });
    
    const series = ['LDF', 'UDF', 'NDA', 'Others'].map(alliance => ({
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
    
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['LDF', 'UDF', 'NDA', 'Others'], bottom: 0 },
      grid: { left: 40, right: 20, top: 20, bottom: 50 },
      xAxis: { type: 'category', data: seriesData.map(d => d.year) },
      yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      series
    };
    
    chart.setOption(option);
  }
  
  async function renderStacked() {
    const echarts = await import('echarts');
    const content = document.getElementById('historical-content');
    if (!content) return;
    
    content.style.display = 'none';
    chartContainer.style.display = 'block';
    
    chart = echarts.init(chartContainer, null, { renderer: 'svg' });
    
    const series = ['LDF', 'UDF', 'NDA', 'Others']
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
    
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: series.map(s => s.name), bottom: 0 },
      grid: { left: 40, right: 20, top: 20, bottom: 50 },
      xAxis: { type: 'category', data: seriesData.map(d => d.year) },
      yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      series
    };
    
    chart.setOption(option);
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
    <div class="historical-content" id="historical-content"></div>
    <div class="historical-chart" bind:this={chartContainer}></div>
  </div>
{/if}
