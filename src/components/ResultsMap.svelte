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
  let mapMode = $state('alliance');

  const PARTY_COLORS = {
    LDF: {
      'Communist Party of India (Marxist)': '#CC0000',
      'Communist Party of India': '#E63946',
      'Rashtriya Janata Dal': '#FF6B6B',
    },
    UDF: {
      'Indian National Congress': '#00509E',
      'Indian Union Muslim League': '#0078FF',
      'Kerala Congress': '#0096D6',
      'Independent': '#29B6F6',
      'Revolutionary Socialist Party': '#4FC3F7',
      'Revolutionary Marxist Party of India': '#00A3E0',
      'Kerala Congress (Jacob)': '#00B0FF',
      'Communist Marxist Party Kerala State Committee': '#0066CC',
    },
    NDA: {
      'Bharatiya Janata Party': '#E68A00',
    },
  };

  function getPartyColor(party, alliance) {
    const allianceColors = PARTY_COLORS[alliance] || {};
    return allianceColors[party] || ALLIANCE_COLORS[alliance] || '#999';
  }

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
      mapMode;
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

          if (alliance && leader) {
            if (mapMode === 'party') {
              path.style('fill', getPartyColor(leader.party, alliance));
            } else {
              path.style('fill', ALLIANCE_COLORS[alliance]);
            }
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
          const candidateName = lang === 'ml' ? (leader.name_ml || leader.name) : leader.name;
          const color = mapMode === 'party' ? getPartyColor(leader.party, alliance) : ALLIANCE_COLORS[alliance];
          html += `<br/><span style="color:${color};font-weight:600">${candidateName}</span>`;
          html += `<br/>${leader.party} (${alliance})`;
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

  function getAllianceParties() {
    const partiesByAlliance = { LDF: new Set(), UDF: new Set(), NDA: new Set(), Others: new Set() };
    for (const c of constituencies) {
      const sorted = [...c.candidates].sort((a, b) => b.votes - a.votes);
      if (sorted.length > 0 && sorted[0].votes > 0) {
        const leader = sorted[0];
        const alliance = ['LDF', 'UDF', 'NDA'].includes(leader.alliance) ? leader.alliance : 'Others';
        partiesByAlliance[alliance].add(leader.party);
      }
    }
    const result = [];
    for (const alliance of ['LDF', 'UDF', 'NDA', 'Others']) {
      const parties = Array.from(partiesByAlliance[alliance]);
      if (parties.length > 0) {
        result.push({
          alliance,
          parties: parties.map(name => ({
            name,
            color: getPartyColor(name, alliance),
          })),
        });
      }
    }
    return result;
  }
</script>

<div class="results-map-section">
  {#if mapSvgText && constituencies.length > 0}
    <div class="results-map-container">
      <div id="results-map"></div>
      <div class="map-legend" class:open={legendOpen} class:mode-alliance={mapMode === 'alliance'} class:mode-party={mapMode === 'party'}>
        <button class="legend-toggle" onclick={() => legendOpen = !legendOpen}>
          <svg class="legend-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
          <span class="legend-toggle-text">Legend</span>
          <svg class="legend-chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        <div class="legend-content">
          <div class="legend-mode-switcher">
            <button class="mode-btn" class:active={mapMode === 'alliance'} onclick={() => { mapMode = 'alliance'; if (mapSvgText && constituencies.length > 0) initMap(); }}>Alliance</button>
            <button class="mode-btn" class:active={mapMode === 'party'} onclick={() => { mapMode = 'party'; if (mapSvgText && constituencies.length > 0) initMap(); }}>Party</button>
          </div>
          <div class="legend-alliance-view">
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
          <div class="legend-party-view">
            <div class="legend-title">Leading Party</div>
            {#each getAllianceParties() as allianceGroup}
              <div class="legend-party-group">{allianceGroup.alliance}</div>
              {#each allianceGroup.parties as party}
                <div class="legend-item">
                  <span class="legend-dot" style="background: {party.color}"></span>
                  <span>{party.name}</span>
                </div>
              {/each}
            {/each}
            <div class="legend-item">
              <span class="legend-dot" style="background: #d1d5db"></span>
              <span>Pending</span>
            </div>
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

  .map-legend.open .legend-content {
    display: block;
  }

  .map-legend.open {
    border-radius: 6px;
  }

  .legend-content {
    padding: 8px 12px 10px;
  }

  .legend-mode-switcher {
    display: flex;
    gap: 2px;
    background: var(--border);
    border-radius: 4px;
    padding: 2px;
    margin-bottom: 10px;
  }

  .mode-btn {
    flex: 1;
    padding: 4px 8px;
    border: none;
    border-radius: 3px;
    background: transparent;
    font-family: 'Manjari', monospace;
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    color: var(--muted);
    transition: background 0.15s, color 0.15s;
  }

  .mode-btn.active {
    background: var(--card);
    color: var(--text);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .legend-party-group {
    font-size: 9px;
    font-weight: 700;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 8px;
    margin-bottom: 2px;
    padding-bottom: 2px;
    border-bottom: 1px solid var(--border);
  }

  .map-legend.mode-alliance :global(.legend-party-view) {
    display: none;
  }

  .map-legend.mode-party :global(.legend-alliance-view) {
    display: none;
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

    .map-legend.open .legend-content {
      display: block;
    }

    .map-legend.open {
      border-radius: 6px;
    }

    .legend-content {
      padding: 0 10px 10px;
      border-top: 0;
      margin-top: 0;
    }
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

    .legend-content {
      padding: 0 10px 10px;
      border-top: 0;
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

  .legend-toggle {
    display: none;
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
    padding: 8px 12px 10px;
  }

  .legend-mode-switcher {
    display: flex;
    gap: 2px;
    background: var(--border);
    border-radius: 4px;
    padding: 2px;
    margin-bottom: 10px;
  }

  .mode-btn {
    flex: 1;
    padding: 4px 8px;
    border: none;
    border-radius: 3px;
    background: transparent;
    font-family: 'Manjari', monospace;
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    color: var(--muted);
    transition: background 0.15s, color 0.15s;
  }

  .mode-btn.active {
    background: var(--card);
    color: var(--text);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .legend-party-group {
    font-size: 9px;
    font-weight: 700;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 8px;
    margin-bottom: 2px;
    padding-bottom: 2px;
    border-bottom: 1px solid var(--border);
  }

  .map-legend.mode-alliance :global(.legend-party-view) {
    display: none;
  }

  .map-legend.mode-party :global(.legend-alliance-view) {
    display: none;
  }
</style>
