<script>
  import { onMount } from 'svelte';
  import * as echarts from 'echarts';

  export let constituencyNumber = null;
  export let constituencyQid = null;

  const COLORS = {
    LDF: '#D94040',
    UDF: '#1565C0',
    NDA: '#E07828',
    Others: '#33AA55'
  };

  const ALLIANCES = ['LDF', 'UDF', 'NDA', 'Others'];
  const YEARS = ['2011', '2016', '2021'];

  let currentView = $state('bars');
  let chartContainer;
  let chart = null;

  // Placeholder data structure — replace with actual data import once available.
  // Expected shape: { [constituencyQid]: { [year]: { allianceVotes: {LDF,UDF,NDA,Others}, totalVotes, winner } } }
  // For now returns empty so the "data pending" state renders.
  function getNiyamasabhaData(qid) {
    if (!qid) return [];
    // TODO: import from src/data/niyamasabha-historical.json once data is available
    return [];
  }

  $: seriesData = getNiyamasabhaData(constituencyQid);
  $: hasData = seriesData.length > 0;

  $: if (chartContainer && hasData && currentView === 'stacked') {
    renderChart();
  }

  onMount(() => {
    return () => { if (chart) chart.dispose(); };
  });

  function setView(v) { currentView = v; }

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
      tooltip: { trigger: 'axis' },
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

  function getWinner(yearData) {
    let max = 0; let winner = '';
    for (const al of ALLIANCES) {
      if ((yearData.allianceVotes[al] || 0) > max) {
        max = yearData.allianceVotes[al];
        winner = al;
      }
    }
    return winner;
  }
</script>

{#if !hasData}
  <div class="pending-box">
    <div class="pending-years">
      {#each YEARS as yr}
        <span class="yr-pill">{yr}</span>
      {/each}
    </div>
    <div class="pending-text">
      Niyamasabha results data pending
      <span class="pending-sub">Data for 2011, 2016 &amp; 2021 assembly elections will be added soon.</span>
    </div>
  </div>
{:else}
  <div class="historical-chart-container">
    <div class="historical-switcher">
      <button class="hist-switch-btn" class:active={currentView === 'bars'} on:click={() => setView('bars')}>Bars</button>
      <button class="hist-switch-btn" class:active={currentView === 'stacked'} on:click={() => setView('stacked')}>Stacked</button>
      <button class="hist-switch-btn" class:active={currentView === 'table'} on:click={() => setView('table')}>Table</button>
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
              <th>Election</th>
              {#each ALLIANCES as al}
                <th style="color:{COLORS[al]}">{al}</th>
              {/each}
              <th>Winner</th>
            </tr>
          </thead>
          <tbody>
            {#each seriesData as yearData}
              {@const winner = getWinner(yearData)}
              <tr>
                <td class="year-cell">{yearData.year}</td>
                {#each ALLIANCES as al}
                  <td class="pct-cell" class:winner-cell={winner === al}>
                    {yearData.allianceVotes[al] > 0 ? getPct(yearData.allianceVotes[al], yearData.totalVotes) + '%' : '—'}
                  </td>
                {/each}
                <td>
                  <span class="winner-badge" style="background:{COLORS[winner]}20;color:{COLORS[winner]};border:1px solid {COLORS[winner]}50">
                    {winner}
                  </span>
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
  /* Pending state */
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

  .pending-years {
    display: flex;
    gap: 8px;
  }

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

  .pending-text {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.05em;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .pending-sub {
    font-size: 10px;
    color: var(--faint);
    font-weight: 400;
    letter-spacing: 0.02em;
  }

  /* Shared chart styles */
  .historical-chart-container { margin-top: 8px; }

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

  .hist-switch-btn:hover { border-color: var(--text); color: var(--text); }
  .hist-switch-btn.active { background: var(--text); color: var(--card); border-color: var(--text); }

  .vertical-bars-view {
    display: flex;
    gap: 20px;
    align-items: flex-end;
  }

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
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    color: var(--text);
  }

  .hist-table tbody tr:hover { background: var(--bg2); }
  .year-cell { font-weight: 700; color: var(--muted) !important; }
  .pct-cell { text-align: right; }
  .winner-cell { font-weight: 700; }

  .winner-badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 10px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
  }
</style>
