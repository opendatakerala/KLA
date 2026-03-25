<script>
  import * as d3 from 'd3';
  import candidatesByParty from '../../data/candidates-by-party.json';

  const PARTY_PALETTE = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', 
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
    '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'
  ];

  function renderAlliance(alliance, containerId) {
    const container = document.querySelector(`#${containerId} .party-list`);
    if (!container) return;

    const parties = candidatesByParty[alliance] || {};
    const data = Object.entries(parties).sort((a, b) => b[1] - a[1]);
    const total = d3.sum(data, d => d[1]);

    container.innerHTML = '';

    data.forEach(([name, count], idx) => {
      const prop = total > 0 ? count / total : 0;
      const minSize = 11;
      const maxSize = 24;
      const fontSize = minSize + prop * (maxSize - minSize);
      const color = PARTY_PALETTE[idx % PARTY_PALETTE.length];

      const div = document.createElement('div');
      div.className = 'party-item';
      div.style.minHeight = '24px';
      div.innerHTML = `
        <div class="party-bar" style="width: ${prop * 100}%; background: ${color}; height: 24px;"></div>
        <span class="party-name" style="font-size: ${fontSize}px">${name}</span>
        <span class="party-count" style="font-size: ${fontSize * 0.7}px">${count}</span>
      `;
      container.appendChild(div);
    });
  }

  import { onMount } from 'svelte';
  onMount(() => {
    renderAlliance('LDF', 'party-ldf');
    renderAlliance('UDF', 'party-udf');
    renderAlliance('NDA', 'party-nda');
    renderAlliance('Others', 'party-others');
  });
</script>

<div class="party-dist" id="party-dist">
  <div class="party-alliance" id="party-ldf">
    <div class="alliance-label">LDF</div>
    <div class="party-list"></div>
  </div>
  <div class="party-alliance" id="party-udf">
    <div class="alliance-label">UDF</div>
    <div class="party-list"></div>
  </div>
  <div class="party-alliance" id="party-nda">
    <div class="alliance-label">NDA</div>
    <div class="party-list"></div>
  </div>
  <div class="party-alliance" id="party-others">
    <div class="alliance-label">Others</div>
    <div class="party-list"></div>
  </div>
</div>

<style>
  .party-dist {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  @media (max-width: 500px) {
    .party-dist {
      grid-template-columns: 1fr;
    }
  }

  .party-alliance {
    padding: 16px;
    background: var(--card2);
    border-radius: 8px;
  }

  .alliance-label {
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.1em;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  #party-ldf .alliance-label { color: #EE0000; }
  #party-udf .alliance-label { color: #0078FF; }
  #party-nda .alliance-label { color: #FF9933; }
  #party-others .alliance-label { color: #33AA00; }

  .party-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .party-bar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    opacity: 0.15;
    z-index: -1;
  }

  .party-item {
    display: flex;
    align-items: baseline;
    gap: 8px;
    line-height: 1.2;
    position: relative;
    min-height: 1.5em;
  }

  .party-name {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    color: var(--text);
  }

  .party-count {
    font-family: 'DM Mono', monospace;
    color: var(--muted);
    font-weight: 500;
  }
</style>
