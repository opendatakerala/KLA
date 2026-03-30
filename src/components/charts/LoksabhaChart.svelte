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
  import { _ } from '../../lib/i18n.js';

  let { constituencyQid = null, data = [], loading = false, error = false, forceView = null } = $props();

  const COLORS = {
    LDF: '#D94040',
    UDF: '#1565C0',
    NDA: '#E07828',
    Others: '#33AA55'
  };

  const ALLIANCES = ['LDF', 'UDF', 'NDA'];
  const ALLIANCES_WITH_OTHERS = ['LDF', 'UDF', 'NDA', 'Others'];
  const YEARS = ['2024', '2019', '2014'];

  let internalView = $state('simple');
  let currentView = $derived(forceView || internalView);
  let chartContainer = $state(null);
  let chart = null;

  let seriesData = $derived([...data].reverse());
  let hasData = $derived(seriesData.length > 0);
  let parliamentaryConstituency = $derived(seriesData[0]?.parliamentaryConstituency || '');

  $effect(() => {
    if (chartContainer && hasData && (currentView === 'bars' || currentView === 'stacked')) {
      renderChart();
    }
  });

  onMount(() => {
    return () => { if (chart) chart.dispose(); };
  });

  function setView(v) { if (!forceView) internalView = v; }

  function goBack() { if (!forceView) internalView = 'simple'; }

  function getSimpleText(yearData) {
    const winner = yearData.winner;
    if (!winner) return '';
    const party = winner.party || '';
    const alliance = winner.alliance || '';
    const margin = yearData.margin?.toLocaleString() || '0';
    return $_('charts.leadBy', { values: { party, alliance, margin } });
  }

  function renderChart() {
    if (!chartContainer || !hasData) return;
    
    if (chart) {
      chart.dispose();
      chart = null;
    }
    chart = echarts.init(chartContainer, null, { renderer: 'svg' });

    const isStacked = currentView === 'stacked';
    const activeAlliances = isStacked ? ALLIANCES_WITH_OTHERS : ALLIANCES;
    
    const series = activeAlliances
      .filter(al => seriesData.some(d => d.allianceVotes[al] > 0))
      .map(al => ({
        name: al,
        type: 'bar',
        stack: isStacked ? 'total' : undefined,
        data: seriesData.map(d => {
          const allianceVotes = d.allianceVotes[al] || 0;
          const pct = d.totalVotes > 0 ? (allianceVotes / d.totalVotes) * 100 : 0;
          let candidateName = '';
          let candidateParty = '';
          let candidateVotes = 0;
          
          if (d.winner?.alliance === al) {
            candidateName = d.winner.name || '';
            candidateParty = d.winner.party || '';
            candidateVotes = d.winner.votes || 0;
          } else if (d.runnerUp?.alliance === al) {
            candidateName = d.runnerUp.name || '';
            candidateParty = d.runnerUp.party || '';
            candidateVotes = d.runnerUp.votes || 0;
          } else if (d.candidates) {
            const cand = d.candidates.find(c => c.alliance === al);
            if (cand) {
              candidateName = cand.candidate || '';
              candidateParty = cand.party || '';
              candidateVotes = cand.votes || 0;
            }
          }
          
          return {
            value: parseFloat(pct.toFixed(1)),
            candidate: candidateName,
            party: candidateParty,
            votes: candidateVotes
          };
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
        confine: true,
        formatter: (params) => {
          const yearData = seriesData[params[0].dataIndex];
          let html = `<b>${yearData.year}</b><br/>`;
          params.forEach(p => {
            const item = p.data;
            const votes = item.votes;
            html += `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: ${p.value}% (${votes.toLocaleString()} votes)<br/>`;
            if (item.candidate && item.party) {
              html += `<span style="margin-left:16px;font-size:10px;color:#666">${item.candidate} (${item.party})</span><br/>`;
            }
          });
          return html;
        }
      },
      legend: { data: activeAlliances, bottom: 0, textStyle: { fontSize: 10 } },
      grid: { left: 44, right: 16, top: 16, bottom: 44 },
      xAxis: { type: 'category', data: seriesData.map(d => d.year) },
      yAxis: { type: 'value', max: isStacked ? 100 : undefined, axisLabel: { formatter: (v) => v + (isStacked ? '%' : '') } },
      series
    }, { notMerge: true });
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
    <span class="loading-text">{$_('charts.loadingData')}</span>
  </div>
{:else if error}
  <div class="error-box">
    <span class="error-text">{$_('charts.failedToLoad')}</span>
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
      <span class="pending-sub">{$_('charts.loksabhaDataForYears', { values: { years: YEARS.join(', ') } })}</span>
    </div>
  </div>
{:else if currentView === 'simple'}
  <div class="simple-view">
    {#each seriesData as yearData}
      <div class="simple-year-row" onclick={() => setView('bars')}>
        <span class="simple-year">{yearData.year}</span>
        <span class="simple-result">{getSimpleText(yearData)}</span>
      </div>
    {/each}
    <button class="view-details-btn" onclick={() => setView('bars')}>{$_('charts.viewDetails')}</button>
  </div>
{:else}
  <div class="historical-chart-container">
    {#if !forceView}
      <button class="back-btn" onclick={goBack}>← Back</button>
    {/if}
    <div class="historical-switcher">
      {#if !forceView}
        <button class="hist-switch-btn" class:active={currentView === 'bars'} onclick={() => setView('bars')}>{$_('charts.bars')}</button>
        <button class="hist-switch-btn" class:active={currentView === 'stacked'} onclick={() => setView('stacked')}>{$_('charts.stacked')}</button>
        <button class="hist-switch-btn" class:active={currentView === 'table'} onclick={() => setView('table')}>{$_('charts.table')}</button>
      {/if}
    </div>

    {#if currentView === 'bars'}
      <div class="chart-view" bind:this={chartContainer}></div>

    {:else if currentView === 'stacked'}
      <div class="chart-view" bind:this={chartContainer}></div>

    {:else if currentView === 'table'}
      <div class="table-view">
        <table class="hist-table">
          <thead>
            <tr>
              <th>{$_('charts.year')}</th>
              <th>{$_('charts.candidates')}</th>
              <th>{$_('charts.votes')}</th>
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
    font-family: 'Manjari', monospace;
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
    font-family: 'Manjari', monospace;
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
    font-family: 'Manjari', monospace;
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
    align-self: center;
  }

  .view-details-btn:hover {
    border-color: var(--text);
    color: var(--text);
  }

  .historical-chart-container { margin-top: 8px; }

  .back-btn {
    font-family: 'Manjari', monospace;
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
    font-family: 'Manjari', monospace;
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

  .chart-view { width: 100%; height: 260px; }

  .table-view { overflow-x: auto; }

  .hist-table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Manjari', monospace;
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
    font-family: 'Manjari', monospace;
    font-size: 11px;
    white-space: nowrap;
  }

  .votes-cell div { display: block; margin-bottom: 2px; }
  .margin-line { font-weight: 700; color: var(--text); font-size: 10px; }
</style>