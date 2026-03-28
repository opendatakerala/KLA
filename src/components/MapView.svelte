<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import mapSvgText from '../data/kla-map.svg?raw';
  import { _ } from '../lib/i18n.js';
  import { filteredConstituencies, openModal, constituencies, filters, districtBounds } from '../stores/constituencyStore.js';
  import Modal from './Modal.svelte';

  let mapSvg = null;
  const viewWidth = 263;
  const viewHeight = 345;
  
  $: allData = $constituencies;
  $: filteredData = $filteredConstituencies;

  function initMap() {
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
        if (row) openModal(row);
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

  $: if (mapSvg && filteredData) {
    updateMap();
  }

  onMount(() => {
    initMap();
  });
</script>

<div class="map-view" id="map-view">
  <div class="map-container" id="map-container">
    <div id="kerala-map"></div>
    <div class="map-legend" id="map-legend">
      <div class="map-legend-title">{$_('map.reservedSeats')}</div>
      <div class="map-legend-item"><div class="map-legend-dot sc"></div><span>{$_('map.scReserved')}</span></div>
      <div class="map-legend-item"><div class="map-legend-dot st"></div><span>{$_('map.stReserved')}</span></div>
    </div>
    <div class="map-tooltip" id="map-tooltip"></div>
  </div>
</div>

<Modal />

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
    fill: #7C3AED;
  }

  #kerala-map :global(path.const-path.reserved-st) {
    fill: #0B7A56;
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
  }

  .map-legend-title {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .map-legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    font-size: 11px;
  }

  .map-legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    border: 1.5px solid;
  }

  .map-legend-dot.sc {
    background: var(--sc-bg);
    border-color: var(--sc-color);
  }

  .map-legend-dot.st {
    background: var(--st-bg);
    border-color: var(--st-color);
  }

  .map-tooltip {
    position: fixed;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 6px 10px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    pointer-events: none;
    display: none;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
</style>
