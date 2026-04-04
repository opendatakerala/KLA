<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { _ } from '../lib/i18n.js';
  import { filteredConstituencies, openModal, constituencies, filters, districtBounds } from '../stores/constituencyStore.js';
  import { setConstituencyHash } from '../stores/routerStore.js';
  import partyData from '../data/candidates-by-party.json';
  import partyLookup from '../data/party-lookup.json';

  const ALLIANCE_COLORS = {
    LDF: '#EE0000',
    UDF: '#0078FF',
    NDA: '#FF9933',
    Others: '#33AA00'
  };

  function getAllianceParties(alliance) {
    const parties = partyData[alliance] || {};
    return Object.keys(parties);
  }

  function getPartyColor(party) {
    if (!party) return '#9ca3af';
    
    const entry = partyLookup[party];
    if (!entry?.color) return '#9ca3af';
    
    return entry.color;
  }

  function getPartyAlliance(party) {
    const entry = partyLookup[party];
    return entry?.alliance || null;
  }

  let mapSvgText = $state('');
  let mapLoading = $state(true);
  let mapSvg = null;
  const viewWidth = 263;
  const viewHeight = 345;
  
  let selectedAlliance = $state('LDF');
  let mapWidth = $state(600);
  let isResizing = $state(false);
  let legendCollapsed = $state(false);
  let userToggled = $state(false);

  onMount(() => {
    const container = document.getElementById('map-container');
    if (container) {
      mapWidth = container.offsetWidth;
    }
    legendCollapsed = mapWidth < 600;
    loadMap();
  });

  $effect(() => {
    const shouldBeCollapsed = mapWidth < 600;
    if (!userToggled && legendCollapsed !== shouldBeCollapsed) {
      legendCollapsed = shouldBeCollapsed;
    }
  });

  function toggleLegend() {
    legendCollapsed = !legendCollapsed;
    userToggled = true;
  }

  function startResize(e) {
    isResizing = true;
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  }

  function resize(e) {
    if (!isResizing) return;
    const newWidth = Math.max(300, Math.min(1600, e.clientX - document.getElementById('map-container').getBoundingClientRect().left));
    mapWidth = newWidth;
  }

  function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
  }

  let allData = $derived($constituencies);
  let filteredData = $derived($filteredConstituencies);

  let noFilters = $derived(
    $filters.district === 'all' &&
    $filters.party === 'all' &&
    $filters.reservation === 'all' &&
    $filters.search === '' &&
    !$filters.women
  );

  let allianceParties = $derived(() => {
    const parties = partyData[selectedAlliance] || {};
    return Object.entries(parties)
      .sort((a, b) => b[1] - a[1])
      .map(([party, count], idx) => ({
        party,
        count,
        color: getPartyColor(party)
      }));
  });

  onMount(() => {
    loadMap();
  });

  async function loadMap() {
    try {
      const raw = await import('../data/kla-map.svg?raw');
      mapSvgText = raw.default;
      mapLoading = false;
      // Wait for next tick to ensure div exists
      setTimeout(() => initMap(), 0);
    } catch (e) {
      console.error('Failed to load map', e);
    }
  }

  function initMap() {
    if (!mapSvgText) return;
    const container = document.getElementById('kerala-map');
    if (!container) return;

    // Remove style tag from SVG to prevent global CSS conflicts
    const svgWithoutStyle = mapSvgText.replace(/<style>.*?<\/style>/s, '');
    container.innerHTML = svgWithoutStyle;
    
    mapSvg = d3.select(container).select('svg');
    
    const tooltip = document.getElementById('map-tooltip');

    mapSvg.selectAll('path')
      .each(function() {
        const path = d3.select(this);
        const qid = path.attr('data-qid');
        const row = allData.find(x => x.qid === qid);
        
        if (row) {
          const isSc = row.reservation === 'SC';
          const isSt = row.reservation === 'ST';
          path
            .attr('id', 'c' + row.number)
            .attr('data-num', row.number)
            .classed('const-path', true)
            .classed('reserved-sc', isSc)
            .classed('reserved-st', isSt);
        } else {
          path.classed('const-path', true);
        }
      })
      .on('mouseenter', function(event) {
        const path = d3.select(this);
        const qid = path.attr('data-qid');
        const row = allData.find(x => x.qid === qid);
        const name = row ? row.name : (path.attr('data-name') || '');
        const num = row ? row.number : '';
        
        const candidates = row?.candidates || [];
        const ldfCandidate = candidates.find(c => c.alliance === 'LDF' && c.name);
        const udfCandidate = candidates.find(c => c.alliance === 'UDF' && c.name);
        const ndaCandidate = candidates.find(c => c.alliance === 'NDA' && c.name);
        
        if (tooltip) {
          tooltip.textContent = (num ? '#' + num + ' ' : '') + name;
          tooltip.style.display = 'block';
        }
      })
      .on('mousemove', function(event) {
        if (tooltip) {
          tooltip.style.left = (event.clientX + 14) + 'px';
          tooltip.style.top = (event.clientY - 8) + 'px';
        }
      })
      .on('mouseleave', function() {
        if (tooltip) tooltip.style.display = 'none';
      })
      .on('click', function() {
        const path = d3.select(this);
        const qid = path.attr('data-qid');
        const row = allData.find(x => x.qid === qid);
        if (row) {
          setConstituencyHash(row.number);
          openModal(row);
        }
      });
    
    updateMap();
  }

  function updateMap() {
    if (!mapSvg) return;

    const filteredIds = new Set(filteredData.map(c => c.qid));
    
    mapSvg.selectAll('.const-path').each(function() {
      const path = d3.select(this);
      const qid = path.attr('data-qid');
      const row = allData.find(x => x.qid === qid);
      
      if (!row) return;
      
      const isMatch = filteredIds.has(row.qid);
      path.classed('highlighted', isMatch)
          .classed('dimmed', !isMatch);

      const isSc = row.reservation === 'SC';
      const isSt = row.reservation === 'ST';

      if (isSc) {
        path.style('stroke', '#7C3AED').style('stroke-width', '0.008');
      } else if (isSt) {
        path.style('stroke', '#0B7A56').style('stroke-width', '0.008');
      } else {
        path.style('stroke', '#232323').style('stroke-width', '0.003');
      }

      if (noFilters) {
        const candidates = row.candidates || [];
        const candidate = candidates.find(c => c.alliance === selectedAlliance && c.name);
        if (candidate) {
          const color = getPartyColor(candidate.party);
          path.style('fill', color);
        } else {
          path.style('fill', '#9ca3af');
        }
      } else {
        path.style('fill', '#9ca3af');
      }
    });

    const district = $filters.district;
    if (district === 'all') {
      mapSvg.transition()
        .duration(500)
        .attr('viewBox', `0 0 ${viewWidth} ${viewHeight}`);
    } else {
      const bounds = districtBounds[district.toUpperCase()];
      if (bounds) {
        const padding = 5;
        const vb = `${bounds.minX - padding} ${bounds.minY - padding} ${bounds.maxX - bounds.minX + padding * 2} ${bounds.maxY - bounds.minY + padding * 2}`;
        mapSvg.transition()
          .duration(500)
          .attr('viewBox', vb);
      }
    }
  }

  $effect(() => {
    const data = $filteredConstituencies;
    const svg = mapSvg;
    const filtersState = $filters;
    const alliance = selectedAlliance;
    const filtersActive = noFilters;
    if (svg && data) {
      updateMap();
    }
  });
</script>

<div class="map-view" id="map-view">
  <div class="map-container" id="map-container" style:max-width="{mapWidth}px">
    {#if mapLoading}
      <div class="map-loader">
        <div class="shimmer"></div>
        <span>{$_('charts.loading')}</span>
      </div>
    {/if}
    <div id="kerala-map" style:visibility={mapLoading ? 'hidden' : 'visible'}></div>
    <div class="resize-handle" onmousedown={startResize}></div>
    <div class="map-legend" id="map-legend">
      <button class="legend-toggle" onclick={toggleLegend}>
        <span class="toggle-icon">{legendCollapsed ? '▼' : '▲'}</span> {$_('map.legend')}
      </button>
      <div class="legend-content" class:collapsed={legendCollapsed}>
        <div class="map-legend-section">
          <div class="map-legend-title">{$_('map.reservedSeats')}</div>
          <div class="map-legend-item">
            <div class="map-legend-dot general"></div>
            <span>General</span>
          </div>
          <div class="map-legend-item">
            <div class="map-legend-dot sc"></div>
            <span>{$_('map.scReserved')}</span>
          </div>
          <div class="map-legend-item">
            <div class="map-legend-dot st"></div>
            <span>{$_('map.stReserved')}</span>
          </div>
        </div>
        {#if noFilters}
          <div class="map-legend-section">
            <div class="alliance-switcher">
              <button class="alliance-btn" class:active={selectedAlliance === 'LDF'} style:--active-color=var(--ldf) onclick={() => selectedAlliance = 'LDF'}>LDF</button>
              <button class="alliance-btn" class:active={selectedAlliance === 'UDF'} style:--active-color=var(--udf) onclick={() => selectedAlliance = 'UDF'}>UDF</button>
              <button class="alliance-btn" class:active={selectedAlliance === 'NDA'} style:--active-color=var(--nda) onclick={() => selectedAlliance = 'NDA'}>NDA</button>
            </div>
            <div class="map-legend-title">{selectedAlliance} Parties</div>
            {#each allianceParties() as p}
              <div class="map-legend-item">
                <div class="map-legend-dot" style:background={p.color}></div>
                <span>{p.party} ({p.count})</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    <div class="map-tooltip" id="map-tooltip"></div>
  </div>
</div>


<style>
  .map-view {
    margin-bottom: 24px;
  }

  .map-container {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    position: relative;
    min-height: 500px;
  }

  #kerala-map {
    width: 100%;
    height: auto;
  }

  #kerala-map :global(svg) {
    width: 100%;
    height: auto;
    display: block;
  }

  #kerala-map :global(path.const-path) {
    transition: opacity 0.2s, stroke-width 0.2s, fill 0.2s;
    cursor: pointer;
    fill: #9ca3af;
    stroke: #232323;
    stroke-width: 0.003;
  }

  #kerala-map :global(path.const-path.reserved-sc) {
    stroke: #7C3AED;
    stroke-width: 0.008;
  }

  #kerala-map :global(path.const-path.reserved-st) {
    stroke: #0B7A56;
    stroke-width: 0.008;
  }

  #kerala-map :global(path.dimmed) {
    opacity: 0.15;
  }

  #kerala-map :global(path.highlighted) {
    opacity: 1;
    stroke: #000;
    stroke-width: 0.006;
  }

  .map-legend {
    position: absolute;
    top: 16px;
    right: 16px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 10px;
    font-size: 11px;
    max-height: calc(100% - 32px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .legend-toggle {
    width: 100%;
    background: none;
    border: none;
    padding: 6px;
    font-family: 'Manjari', monospace;
    font-size: 11px;
    cursor: pointer;
    text-align: left;
    color: var(--text);
    align-items: center;
    gap: 4px;
  }

  .toggle-icon {
    font-size: 10px;
  }

  .legend-content {
    overflow-y: auto;
    flex: 1;
  }

  .legend-content.collapsed {
    display: none;
  }

  .map-legend-title {
    font-family: 'Manjari', monospace;
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .alliance-switcher {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
  }

  .alliance-btn {
    font-family: 'Manjari', monospace;
    font-size: 10px;
    font-weight: 600;
    padding: 4px 8px;
    border: 1px solid var(--border);
    border-radius: 3px;
    background: var(--card);
    color: var(--text);
    cursor: pointer;
    transition: all 0.2s;
  }

  .alliance-btn:hover {
    background: var(--card2);
  }

  .alliance-btn.active {
    background: var(--active-color, var(--ldf));
    color: #fff;
    border-color: var(--active-color, var(--ldf));
  }

  .map-legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    font-size: 11px;
  }

  .map-legend-section {
    padding-bottom: 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .map-legend-section:last-child {
    padding-bottom: 0;
    margin-bottom: 0;
    border-bottom: none;
  }

  .map-legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    border: 2px solid #232323;
  }

  .map-legend-dot.general {
    border-color: #232323;
  }

  .map-legend-dot.sc {
    border-color: #7C3AED;
  }

  .map-legend-dot.st {
    border-color: #0B7A56;
  }

  .map-tooltip {
    position: fixed;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 6px 10px;
    font-family: 'Manjari', monospace;
    font-size: 11px;
    pointer-events: none;
    display: none;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .map-loader {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    z-index: 5;
    background: var(--card);
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

  .resize-handle {
    position: absolute;
    top: 0;
    right: -4px;
    width: 8px;
    height: 100%;
    cursor: ew-resize;
    z-index: 20;
  }

  .resize-handle::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    width: 4px;
    height: 40px;
    background: var(--border);
    border-radius: 2px;
  }

  .resize-handle:hover::after {
    background: var(--primary);
  }
</style>
