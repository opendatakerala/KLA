<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { _, locale } from '../lib/i18n.js';
  import { ALLIANCE_COLORS } from '../lib/constants.js';
  import ConstituencyCard from './ConstituencyCard.svelte';

  let { constituencies = $bindable([]) } = $props();

  let mapSvgText = $state('');
  let mapSvg = null;
  let selectedConstituency = $state(null);

  let lang = $derived($locale);

  let legendOpen = $state(false);

  let allConstituencies = $derived(() => {
    const map = {};
    for (const c of constituencies) {
      const qid = c.constituency.constituency_Wikidata;
      if (qid) map[qid] = c;
    }
    return map;
  });

  onMount(async () => {
    await loadMap();
    if (mapSvgText) {
      setTimeout(() => initMap(), 0);
    }
  });

  $effect(() => {
    if (mapSvgText && constituencies.length > 0) {
      initMap();
    }
  });

  async function loadMap() {
    try {
      const raw = await import('../data/kla-map.svg?raw');
      mapSvgText = raw.default;
    } catch (e) {
      console.error('Failed to load map', e);
    }
  }

  function initMap() {
    const container = document.getElementById('results-map');
    if (!container || !mapSvgText) return;

    const svgWithoutStyle = mapSvgText.replace(/<style>.*?<\/style>/s, '');
    container.innerHTML = svgWithoutStyle;

    mapSvg = d3.select(container).select('svg');

    const tooltip = document.getElementById('results-map-tooltip');

    mapSvg.selectAll('path')
      .each(function() {
        const path = d3.select(this);
        const qid = path.attr('data-qid');
        const result = allConstituencies()[qid];

        if (result) {
          const sorted = [...result.candidates].sort((a, b) => b.votes - a.votes);
          const leader = sorted[0];
          const alliance = leader?.votes > 0
            ? (['LDF', 'UDF', 'NDA'].includes(leader.alliance) ? leader.alliance : 'Others')
            : null;

          path
            .attr('data-num', result.constituency.constituency_Number)
            .classed('result-path', true)
            .attr('data-alliance', alliance || 'pending');

          if (alliance) {
            path.style('fill', ALLIANCE_COLORS[alliance]);
          } else {
            path.style('fill', '#d1d5db');
          }
        }
      })
      .on('mouseenter', function(event) {
        const path = d3.select(this);
        const qid = path.attr('data-qid');
        const result = allConstituencies()[qid];
        if (!result) return;

        const sorted = [...result.candidates].sort((a, b) => b.votes - a.votes);
        const leader = sorted[0];
        const num = result.constituency.constituency_Number;
        const name = lang === 'ml'
          ? (result.constituency['constituency_Name_ (Malayalam)'] || result.constituency.constituency_Name)
          : result.constituency.constituency_Name;
        const alliance = leader?.votes > 0
          ? (['LDF', 'UDF', 'NDA'].includes(leader.alliance) ? leader.alliance : 'Others')
          : null;

        let html = `<strong>#${num} ${name}</strong>`;
        if (alliance) {
          const color = ALLIANCE_COLORS[alliance];
          const candidateName = lang === 'ml' ? (leader.name_ml || leader.name) : leader.name;
          html += `<br/><span style="color:${color};font-weight:600">${candidateName}</span> (${alliance})`;
          html += `<br/>${leader.party}`;
          html += `<br/>${Number(leader.votes).toLocaleString('en-IN')} votes`;
        } else {
          html += `<br/><span style="color:var(--gold)">Counting in progress</span>`;
        }

        if (tooltip) {
          tooltip.innerHTML = html;
          tooltip.style.display = 'block';
        }

        path.style('stroke', '#000').style('stroke-width', '0.008');
      })
      .on('mousemove', function(event) {
        if (tooltip) {
          tooltip.style.left = (event.clientX + 14) + 'px';
          tooltip.style.top = (event.clientY - 8) + 'px';
        }
      })
      .on('mouseleave', function() {
        if (tooltip) tooltip.style.display = 'none';
        d3.select(this).style('stroke', null).style('stroke-width', null);
      })
      .on('click', function() {
        const path = d3.select(this);
        const qid = path.attr('data-qid');
        const result = allConstituencies()[qid];
        if (result) {
          selectedConstituency = result;
        }
      });
  }

  function closeDetail() {
    selectedConstituency = null;
  }
</script>

<div class="results-map-section">
  {#if mapSvgText && constituencies.length > 0}
    <div class="results-map-container">
      <div id="results-map"></div>
      <div class="map-legend" class:open={legendOpen}>
        <button class="legend-toggle" onclick={() => legendOpen = !legendOpen}>
          <svg class="legend-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
          <span class="legend-toggle-text">Legend</span>
          <svg class="legend-chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        <div class="legend-content">
          <div class="legend-title">Leading Alliance</div>
          {#each Object.entries(ALLIANCE_COLORS) as [alliance, color]}
            <div class="legend-item">
              <span class="legend-dot" style="background: {color}"></span>
              <span>{alliance}</span>
            </div>
          {/each}
          <div class="legend-item">
            <span class="legend-dot" style="background: #d1d5db"></span>
            <span>Pending</span>
          </div>
        </div>
      </div>
      <div class="map-tooltip" id="results-map-tooltip"></div>

      {#if selectedConstituency}
        <div class="map-overlay" onclick={closeDetail}>
          <div class="detail-popup" onclick={(e) => e.stopPropagation()}>
            <button class="detail-close" onclick={closeDetail}>&times;</button>
            <ConstituencyCard
              constituency={selectedConstituency}
              lang={lang}
              expanded={true}
            />
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="map-loader">
      <div class="shimmer"></div>
      <span>{$_('charts.loading')}</span>
    </div>
  {/if}
</div>

<style>
  .results-map-section {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    margin-bottom: 24px;
    padding: 20px;
    position: relative;
  }

  #results-map {
    width: 100%;
    max-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #results-map :global(svg) {
    width: 100%;
    height: auto;
    max-height: 90vh;
    display: block;
    object-fit: contain;
  }

  #results-map :global(path.result-path) {
    transition: fill 0.2s, stroke 0.2s, stroke-width 0.2s;
    cursor: pointer;
    stroke: #232323;
    stroke-width: 0.003;
  }

  .map-legend {
    position: absolute;
    top: 20px;
    right: 20px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 10px;
    font-size: 11px;
  }

  .legend-toggle {
    display: none;
  }

  .legend-title {
    font-family: 'Manjari', monospace;
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    font-size: 11px;
  }

  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    border: 1px solid var(--border);
  }

  .map-tooltip {
    position: fixed;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 12px;
    font-family: 'Manjari', monospace;
    font-size: 12px;
    pointer-events: none;
    display: none;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 250px;
    line-height: 1.4;
  }

  .map-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
  }

  .detail-popup {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    width: 90%;
    max-width: 520px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
  }

  .detail-close {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--card2);
    border: 1px solid var(--border);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text);
    transition: background 0.15s;
    z-index: 1;
  }

  .detail-close:hover {
    background: var(--border);
  }

  .detail-popup :global(.constituency-card) {
    border: none;
    padding: 0;
    cursor: default;
  }

  .detail-popup :global(.constituency-card:hover) {
    border-color: transparent;
    box-shadow: none;
  }

  .detail-popup :global(.card-header) {
    margin-bottom: 12px;
  }

  .detail-popup :global(.expand-icon) {
    display: none;
  }

  .map-loader,
  .map-error {
    min-height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--muted);
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
  }

  .shimmer {
    width: 48px;
    height: 48px;
    background: var(--card2);
    border-radius: 50%;
    animation: pulse 1.5s infinite ease-in-out;
  }

  @keyframes pulse {
    0% { transform: scale(0.95); opacity: 0.5; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(0.95); opacity: 0.5; }
  }

  @media (max-width: 768px) {
    .map-legend {
      top: 20px;
      right: 20px;
      padding: 0;
    }

    .legend-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 6px;
      cursor: pointer;
      font-family: 'Manjari', monospace;
      font-size: 11px;
      color: var(--text);
    }

    .legend-toggle-text {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
    }

    .legend-chevron {
      transition: transform 0.2s;
    }

    .map-legend.open .legend-chevron {
      transform: rotate(180deg);
    }

    .legend-content {
      display: none;
      padding: 8px 12px 10px;
      border-top: 1px solid var(--border);
      margin-top: 0;
      border-radius: 0 0 6px 6px;
    }

    .map-legend.open .legend-content {
      display: block;
    }

    .map-legend.open {
      border-radius: 6px;
    }

    .detail-popup {
      width: 95%;
      padding: 12px;
    }
  }
</style>
