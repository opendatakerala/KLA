<script>
  import { _ } from '../lib/i18n.js';
  import { filteredConstituencies, openModal } from '../stores/constituencyStore.js';
  import Modal from './Modal.svelte';

  let filteredData = $derived($filteredConstituencies);

  function createCandidateRow(alliance, party, name) {
    const allianceClass = alliance === "LDF" ? "LDF" : alliance === "UDF" ? "UDF" : alliance === "NDA" ? "NDA" : "OTH";
    const allianceLabel = alliance === "OTH" ? "Others" : alliance;
    return `
      <div class="candidate-row">
        <span class="alliance-tag ${allianceClass}">${allianceLabel}</span>
        <div>
          <div class="candidate-party">${party || "—"}</div>
          <span class="candidate-name">${name || "TBD"}</span>
        </div>
      </div>
    `;
  }

  function handleCardClick(row) {
    openModal(row);
  }
</script>

<div class="grid" id="grid">
  {#each filteredData as row (row.number)}
    <div
      class="card {row.reservation === 'SC' ? 'reserved-sc' : row.reservation === 'ST' ? 'reserved-st' : ''}"
      onclick={() => handleCardClick(row)}
      onkeydown={(e) => e.key === "Enter" && handleCardClick(row)}
      role="button"
      tabindex="0"
    >
      <div class="card-header">
        <div>
          <div class="card-num">CONSTITUENCY #{row.number}</div>
          <div class="card-name">{row.name}</div>
          <div class="card-district">{row.district}</div>
        </div>
        {#if row.reservation}
          <span class="reservation-badge {row.reservation.toLowerCase()}">
            {row.reservation}
            <span>{$_('modal.reserved')}</span>
          </span>
        {/if}
      </div>
      <div class="card-candidates">
        {#each row.candidates.filter((c) => c.alliance === "LDF") as c}
          {@html createCandidateRow("LDF", c.party, c.name)}
        {/each}
        {#each row.candidates.filter((c) => c.alliance === "UDF") as c}
          {@html createCandidateRow("UDF", c.party, c.name)}
        {/each}
        {#each row.candidates.filter((c) => c.alliance === "NDA") as c}
          {@html createCandidateRow("NDA", c.party, c.name)}
        {/each}
        {#each row.candidates.filter((c) => c.alliance === "Others") as c}
          {@html createCandidateRow("OTH", c.party, c.name)}
        {/each}
      </div>
    </div>
  {/each}

  {#if filteredData.length === 0}
    <div class="empty-state">
      <span>{$_('results.empty')}</span>
    </div>
  {/if}
</div>

<Modal />

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    margin-top: 16px;
  }

  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 14px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .card:hover {
    border-color: var(--gold-mid);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .card.reserved-sc {
    border-left: 3px solid var(--sc-color);
  }

  .card.reserved-st {
    border-left: 3px solid var(--st-color);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
  }

  .card-num {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  .card-name {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 15px;
    color: var(--text);
    margin-top: 2px;
  }

  .card-district {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    margin-top: 2px;
  }

  .reservation-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 6px;
    border-radius: 4px;
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.05em;
    flex-shrink: 0;
  }

  .reservation-badge.sc {
    background: var(--sc-bg);
    color: var(--sc-color);
  }

  .reservation-badge.st {
    background: var(--st-bg);
    color: var(--st-color);
  }

  .card-candidates {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  :global(.candidate-row) {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  :global(.alliance-tag) {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    font-weight: 600;
    padding: 2px 5px;
    border-radius: 3px;
    letter-spacing: 0.05em;
    min-width: 32px;
    text-align: center;
  }

  :global(.alliance-tag.LDF) {
    background: #ffebee;
    color: #EE0000;
  }

  :global(.alliance-tag.UDF) {
    background: #e3f2fd;
    color: #0078FF;
  }

  :global(.alliance-tag.NDA) {
    background: #fff3e0;
    color: #FF9933;
  }

  :global(.alliance-tag.OTH) {
    background: var(--card2);
    color: var(--muted);
  }

  :global(.candidate-party) {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 12px;
    color: var(--text);
  }

  :global(.candidate-name) {
    font-size: 11px;
    color: var(--muted);
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 13px;
  }
</style>
