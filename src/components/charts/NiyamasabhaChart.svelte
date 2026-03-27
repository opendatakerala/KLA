<script>
  import { onMount } from 'svelte';
  import * as echarts from 'echarts';

  let { constituencyNumber = null, data = [], loading = false, error = false } = $props();

  const COLORS = {
    LDF: '#D94040',
    UDF: '#1565C0',
    NDA: '#E07828'
  };

  const ALLIANCES = ['LDF', 'UDF', 'NDA'];
  const YEARS = ['2011', '2016', '2021'];

  let currentView = $state('simple');
  let chartContainer = $state(null);
  let chart = null;

  let seriesData = $derived(data);
  let hasData = $derived(seriesData.length > 0);

  $effect(() => {
    if (chartContainer && hasData && currentView === 'stacked') {
      renderChart();
    }
  });

  onMount(() => {
    return () => { if (chart) chart.dispose(); };
  });

  function setView(v) { currentView = v; }

  function goBack() { currentView = 'simple'; }

  function getSimpleText(yearData) {
    const winner = yearData.winner;
    if (!winner) return '';
    const party = winner.party || '';
    const alliance = winner.alliance || '';
    const margin = yearData.margin;
    const marginStr = margin.toLocaleString();
    return `${party} (${alliance}) won by ${marginStr} votes`;
  }

  function renderChart() {
    if (!chartContainer || !hasData) return;
    if (chart) { chart.dispose(); chart = null; }
    chart = echarts.init(chartContainer, null, { renderer: 'svg' });

    const series = ALLIANCES
      .filter(al => seriesData.some(d => d.allianceVotes[al] > 0))
      .map(al => ({
        name: al,
        type: 'bar',
        stack: 'total',
        data: seriesData.map(d => {
          const pct = d.totalVotes > 0 ? (d.allianceVotes[al] / d.totalVotes) * 100 : 0;
          return parseFloat(pct.toFixed(1));
        }),
        itemStyle: { color: COLORS[al] },
        label: {
          show: true,
          formatter: (p) => p.value > 5 ? p.value + '%' : '',
          color: '#fff',
          fontSize: 10,
          fontWeight: 600
        }
      }));

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const yearData = seriesData[params[0].dataIndex];
          let html = `<b>${yearData.year}</b><br/>`;
          params.forEach(p => {
            const votes = yearData.allianceVotes[p.seriesName];
            html += `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: ${p.value}% (${votes.toLocaleString()} votes)<br/>`;
          });
          return html;
        }
      },
      legend: { data: ALLIANCES, bottom: 0, textStyle: { fontSize: 10 } },
      grid: { left: 44, right: 16, top: 16, bottom: 44 },
      xAxis: { type: 'category', data: seriesData.map(d => d.year) },
      yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      series
    });
  }

  function getPct(votes, total) {
    return total > 0 ? ((votes / total) * 100).toFixed(1) : '0.0';
  }

  function formatMargin(votes) {
    return votes.toLocaleString();
  }
</script>

{#if loading}
  <div class="loading-box">
    <span class="loading-text">Loading historical data...</span>
  </div>
{:else if error}
  <div class="error-box">
    <span class="error-text">Failed to load historical data</span>
  </div>
{:else if !hasData}
  <div class="pending-box">
    <div class="pending-years">
      {#each YEARS as yr}
        <span class="yr-pill">{yr}</span>
      {/each}
    </div>
    <div class="pending-text">
      No historical data available
      <span class="pending-sub">Data for {YEARS.join(', ')} assembly elections</span>
    </div>
  </div>
{:else if currentView === 'simple'}
  <div class="simple-view">
    {#each seriesData as yearData}
      <div class="simple-year-row">
        <span class="simple-year">{yearData.year}</span>
        <span class="simple-result">{getSimpleText(yearData)}</span>
      </div>
    {/each}
    <button class="view-details-btn" onclick={() => setView('bars')}>View Details</button>
  </div>
{:else}
  <div class="historical-chart-container">
    <button class="back-btn" onclick={goBack}>← Back</button>
    <div class="historical-switcher">
      <button class="hist-switch-btn" class:active={currentView === 'bars'} onclick={() => setView('bars')}>Bars</button>
      <button class="hist-switch-btn" class:active={currentView === 'stacked'} onclick={() => setView('stacked')}>Stacked</button>
      <button class="hist-switch-btn" class:active={currentView === 'table'} onclick={() => setView('table')}>Table</button>
    </div>

    {#if currentView === 'bars'}
      <div class="vertical-bars-view">
        {#each seriesData as yearData}
          <div class="year-block">
            <div class="year-title">{yearData.year}</div>
            <div class="vertical-bars">
              {#each ALLIANCES as alliance}
                {#if yearData.allianceVotes[alliance] > 0}
                  {@const pct = parseFloat(getPct(yearData.allianceVotes[alliance], yearData.totalVotes))}
                  <div class="vbar-col">
                    <div class="vbar-pct" style="color:{COLORS[alliance]}">{pct}%</div>
                    <div class="vbar-track">
                      <div class="vbar-fill" style="height:{pct}%;background:{COLORS[alliance]}"></div>
                    </div>
                    <div class="vbar-label" style="color:{COLORS[alliance]}">{alliance}</div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      </div>

    {:else if currentView === 'stacked'}
      <div class="chart-view" bind:this={chartContainer}></div>

    {:else if currentView === 'table'}
      <div class="table-view">
        <table class="hist-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Candidates</th>
              <th>Votes</th>
            </tr>
          </thead>
          <tbody>
            {#each seriesData as yearData}
              {@const winner = yearData.winner}
              {@const runnerUp = yearData.runnerUp}
              <tr>
                <td class="year-cell">{yearData.year}</td>
                <td class="candidate-cell">
                  <span class="winner-name">{winner.name}</span>
                  <span class="party" style="color:{COLORS[winner.alliance]}">{winner.party}</span>
                  <span class="alliance-tag" style="background:{COLORS[winner.alliance]}20;color:{COLORS[winner.alliance]}">{winner.alliance}</span>
                  {#if runnerUp}
                    <span class="runnerup-name">{runnerUp.name}</span>
                    <span class="party" style="color:{COLORS[runnerUp.alliance]}">{runnerUp.party}</span>
                    <span class="alliance-tag" style="background:{COLORS[runnerUp.alliance]}20;color:{COLORS[runnerUp.alliance]}">{runnerUp.alliance}</span>
                  {/if}
                </td>
                <td class="votes-cell">
                  <div>{winner.votes.toLocaleString()}</div>
                  <div class="margin-line">+{formatMargin(yearData.margin)}</div>
                  {#if runnerUp}
                    <div>{runnerUp.votes.toLocaleString()}</div>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
{/if}

<style>
  .loading-box, .error-box, .pending-box {
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

  .loading-text, .error-text, .pending-text {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.05em;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .error-text { color: var(--ldf); }

  .pending-sub {
    font-size: 10px;
    color: var(--faint);
    font-weight: 400;
    letter-spacing: 0.02em;
  }

  .pending-years { display: flex; gap: 8px; }

  .yr-pill {
    padding: 3px 10px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 12px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  .simple-view {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .simple-year-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: var(--card2);
    border-radius: 6px;
    font-family: 'DM Mono', monospace;
  }

  .simple-year {
    font-size: 12px;
    font-weight: 700;
    color: var(--muted);
    min-width: 40px;
  }

  .simple-result {
    font-size: 11px;
    color: var(--text);
  }

  .view-details-btn {
    margin-top: 8px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    padding: 8px 16px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.18s;
    align-self: center;
  }

  .view-details-btn:hover {
    border-color: var(--text);
    color: var(--text);
  }

  .historical-chart-container { margin-top: 8px; }

  .back-btn {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    padding: 4px 8px;
    background: transparent;
    border: none;
    color: var(--muted);
    cursor: pointer;
    margin-bottom: 8px;
  }

  .back-btn:hover { color: var(--text); }

  .historical-switcher { display: flex; gap: 8px; margin-bottom: 16px; }

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

  .hist-switch-btn:hover { border-color: var(--text); color: var(--text); }
  .hist-switch-btn.active { background: var(--text); color: var(--card); border-color: var(--text); }

  .vertical-bars-view { display: flex; gap: 20px; align-items: flex-end; }

  .year-block {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .year-title {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  .vertical-bars {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 160px;
    width: 100%;
    justify-content: center;
  }

  .vbar-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    flex: 1;
    max-width: 40px;
    height: 100%;
    justify-content: flex-end;
  }

  .vbar-pct {
    font-family: 'DM Mono', monospace;
    font-size: 8px;
    font-weight: 700;
    line-height: 1;
  }

  .vbar-track {
    width: 100%;
    height: 130px;
    background: var(--bg2);
    border-radius: 3px 3px 0 0;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
  }

  .vbar-fill {
    width: 100%;
    border-radius: 3px 3px 0 0;
    transition: height 0.4s ease;
  }

  .vbar-label {
    font-family: 'DM Mono', monospace;
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .chart-view { width: 100%; height: 260px; }

  .table-view { overflow-x: auto; }

  .hist-table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
  }

  .hist-table th {
    padding: 8px 12px;
    text-align: left;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    border-bottom: 2px solid var(--border);
    background: var(--card2);
  }

  .hist-table td {
    padding: 6px 12px;
    border-bottom: 1px solid var(--border);
    color: var(--text);
    vertical-align: top;
  }

  .hist-table tbody tr:hover { background: var(--bg2); }
  .year-cell { font-weight: 700; color: var(--muted) !important; width: 60px; }
  
  .winner-name { font-weight: 600; font-size: 12px; display: block; }
  .runnerup-name { font-size: 11px; color: var(--muted); display: block; margin-top: 4px; }
  .party { font-weight: 600; font-size: 10px; }
  .alliance-tag {
    display: inline-block;
    padding: 1px 5px;
    border-radius: 6px;
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.04em;
    margin-left: 6px;
  }

  .votes-cell {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    white-space: nowrap;
  }

  .votes-cell div { display: block; margin-bottom: 2px; }
  .margin-line { font-weight: 700; color: var(--text); font-size: 10px; }
</style>