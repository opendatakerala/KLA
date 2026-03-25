<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import mapSvgText from '../data/kla-map.svg?raw';
  import DATA from '../data/constituencies.json';

  let mapSvg = null;
  let mapWomenActive = false;
  let activeMapParty = null;
  let activeMapDistrict = 'all';

  function getPartiesForRow(row) {
    const parties = [];
    if (row.LDF) parties.push(row.LDF);
    if (row.UDF) parties.push(row.UDF);
    if (row.NDA) parties.push(row.NDA);
    if (row.Others_list) {
      row.Others_list.forEach(o => {
        if (o.party) parties.push(o.party);
      });
    }
    return parties;
  }

  function initMap() {
    const container = document.getElementById('kerala-map');
    if (!container) return;

    container.innerHTML = mapSvgText;
    
    mapSvg = d3.select(container).select('svg');
    
    const tooltip = document.getElementById('map-tooltip');

    mapSvg.selectAll('path')
      .each(function() {
        const path = d3.select(this);
        const qid = path.attr('id');
        const row = DATA.find(x => x.Constituency_Wikidata === qid);
        
        if (row) {
          path
            .attr('id', 'c' + row.Constituency_Number)
            .attr('data-num', row.Constituency_Number)
            .attr('class', 'const-path');
        }
        
        path.style('cursor', 'pointer');
      })
      .on('mouseenter', function(event) {
        const path = d3.select(this);
        const qid = path.attr('id');
        const row = DATA.find(x => x.Constituency_Wikidata === qid);
        const name = row ? row.Constituency_Name : (path.attr('data-name') || '');
        const num = row ? row.Constituency_Number : '';
        const al = row ? (row.LDF_Candidate ? 'LDF' : row.UDF_Candidate ? 'UDF' : row.NDA_Candidate ? 'NDA' : '') : '';
        
        if (tooltip) {
          tooltip.textContent = (num ? '#' + num + ' ' : '') + name + (al ? ' · ' + al : '');
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
        const qid = path.attr('id');
        const row = DATA.find(x => x.Constituency_Wikidata === qid);
        if (row && typeof openModal === 'function') openModal(row);
      });
  }

  function getPartyStats() {
    const stats = {};
    DATA.forEach(row => {
      const parties = getPartiesForRow(row);
      parties.forEach(p => {
        let alliance = 'Others';
        if (row.LDF === p) alliance = 'LDF';
        else if (row.UDF === p) alliance = 'UDF';
        else if (row.NDA === p) alliance = 'NDF';
        
        if (!stats[p]) stats[p] = { party: p, alliance, count: 0 };
        stats[p].count++;
      });
    });
    return Object.values(stats).sort((a, b) => b.count - a.count);
  }

  function getDistricts() {
    const districts = [...new Set(DATA.map(r => r.District).filter(Boolean))];
    return districts.sort();
  }

  function buildMapFilters() {
    const partyFilter = document.getElementById('party-filter');
    const partyStats = getPartyStats();
    
    let partyHtml = `<button class="map-party-btn active" data-party="all">
      <span class="mpb-dot" style="background:var(--text)"></span>
      <span class="mpb-label">All Parties</span>
      <span class="mpb-count">${DATA.length}</span>
    </button>`;
    
    partyStats.forEach(p => {
      partyHtml += `<button class="map-party-btn" data-party="${p.party}">
        <span class="mpb-dot" style="background:var(--text)"></span>
        <span class="mpb-label">${p.party}</span>
        <span class="mpb-count">${p.count}</span>
      </button>`;
    });
    partyFilter.innerHTML = partyHtml;
    
    const distFilter = document.getElementById('dist-filter');
    const districts = getDistricts();
    const dCounts = {};
    DATA.forEach(r => { dCounts[r.District] = (dCounts[r.District] || 0) + 1; });
    
    let distHtml = `<button class="dist-btn active" data-district="all">
      <span class="dist-btn-name">All Kerala</span>
      <span class="dist-btn-count">140</span>
    </button>`;
    
    districts.forEach(d => {
      distHtml += `<button class="dist-btn" data-district="${d}">
        <span class="dist-btn-name">${d}</span>
        <span class="dist-btn-count">${dCounts[d]}</span>
      </button>`;
    });
    distFilter.innerHTML = distHtml;
  }

  function updateMapFilter() {
    if (!mapSvg) return;
    
    mapSvg.selectAll('.const-path').each(function() {
      const path = d3.select(this);
      const qid = path.attr('id');
      const row = DATA.find(x => x.Constituency_Wikidata === qid);
      
      let shouldDim = false;
      
      if (activeMapParty && row) {
        const parties = getPartiesForRow(row);
        if (!parties.includes(activeMapParty)) shouldDim = true;
      }
      
      if (activeMapDistrict !== 'all' && row) {
        if (row.District !== activeMapDistrict) shouldDim = true;
      }
      
      if (mapWomenActive && row) {
        const hasWomen = row.LDF_Gender === 'female' || row.UDF_Gender === 'female' || row.NDA_Gender === 'female';
        if (!hasWomen) shouldDim = true;
      }
      
      path.style('opacity', shouldDim ? 0.15 : 1);
    });
  }

  function handleMapPartyClick(e) {
    const btn = e.target.closest('.map-party-btn');
    if (!btn) return;
    
    activeMapParty = btn.dataset.party === 'all' ? null : btn.dataset.party;
    
    document.querySelectorAll('.map-party-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    updateMapFilter();
  }

  function handleMapDistrictClick(e) {
    const btn = e.target.closest('.dist-btn');
    if (!btn) return;
    
    activeMapDistrict = btn.dataset.district === 'all' ? 'all' : btn.dataset.district;
    
    document.querySelectorAll('.dist-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    updateMapFilter();
  }

  function handleMapWomenClick() {
    mapWomenActive = !mapWomenActive;
    document.getElementById('map-women-btn')?.classList.toggle('active', mapWomenActive);
    updateMapFilter();
  }

  function handleMapClearClick() {
    activeMapParty = null;
    activeMapDistrict = 'all';
    mapWomenActive = false;
    
    document.querySelectorAll('.map-party-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.party === 'all');
    });
    document.querySelectorAll('.dist-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.district === 'all');
    });
    document.getElementById('map-women-btn')?.classList.remove('active');
    
    updateMapFilter();
  }

  function initMapController() {
    initMap();
    buildMapFilters();
    
    document.getElementById('party-filter').addEventListener('click', handleMapPartyClick);
    document.getElementById('dist-filter').addEventListener('click', handleMapDistrictClick);
    document.getElementById('map-women-btn')?.addEventListener('click', handleMapWomenClick);
    document.getElementById('map-clear-btn').addEventListener('click', handleMapClearClick);
  }

  onMount(() => {
    initMapController();
  });
</script>
