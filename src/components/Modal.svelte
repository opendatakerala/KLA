<script>
  import { selectedConstituency, closeModal } from '../stores/constituencyStore.js';
  import HistoricalChart from './charts/HistoricalChart.svelte';
  import historicalComparison from '../data/historical-comparison.json';

  $: currentModal = $selectedConstituency;
  
  $: seriesData = currentModal ? getHistoricalData(currentModal.qid) : [];
  
  function getHistoricalData(wikidata) {
    if (!wikidata || !historicalComparison) return [];

    const years = Object.keys(historicalComparison.years || {})
      .slice()
      .reverse();
    const constData = historicalComparison.byConstituency;
    const result = [];

    years.forEach((year) => {
      const yearLabel = historicalComparison.years[year];
      const yearConstituencyData = constData[yearLabel]?.[wikidata];

      if (yearConstituencyData?.candidates) {
        const allianceVotes = { LDF: 0, UDF: 0, NDA: 0, Others: 0 };
        let totalVotes = 0;

        yearConstituencyData.candidates.forEach((c) => {
          const votes = c.votes || 0;
          totalVotes += votes;
          if (c.alliance && allianceVotes.hasOwnProperty(c.alliance)) {
            allianceVotes[c.alliance] += votes;
          } else {
            allianceVotes["Others"] += votes;
          }
        });

        result.push({
          year: yearLabel,
          allianceVotes,
          totalVotes,
        });
      }
    });

    return result;
  }

  function createModalCandidate(alliance, color, party, name) {
    const tbd = !name;
    return `
      <div class="modal-candidate">
        <div class="modal-alliance-bar" style="background:${color}"></div>
        <div class="modal-candidate-inner">
          <div class="modal-alliance-label">${alliance}</div>
          <div class="modal-party" style="color:#000">${party || "—"}</div>
          <div class="modal-candidate-name${tbd ? " tbd" : ""}">${name || "To be announced"}</div>
        </div>
      </div>
    `;
  }

  function handleClose() {
    closeModal();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      handleClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if currentModal}
  <div 
    class="modal-overlay open"
    on:click={handleClose}
    role="button"
    tabindex="0"
  >
    <div 
      class="modal"
      on:click|stopPropagation
      role="dialog"
    >
      <div class="modal-top"></div>
      <div class="modal-header">
        <div class="modal-eyebrow">
          {currentModal.district} · Constituency #{currentModal.number}
        </div>
        <div class="modal-title">{currentModal.name}</div>
        <div class="modal-badges">
          {#if currentModal.reservation}
            <span class="reservation-badge {currentModal.reservation.toLowerCase()}">
              {currentModal.reservation}
              <span data-i18n="modal.reserved">Reserved</span>
            </span>
          {/if}
        </div>
        <button class="modal-close" on:click={handleClose}>
          <span data-i18n="modal.close">✕ Close</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-section-label" data-i18n="modal.contestingCandidates">
          Contesting Candidates
        </div>
        <div class="modal-candidates">
          {#each currentModal.candidates.filter((c) => c.alliance === "LDF") as c}
            {@html createModalCandidate("LDF", "#D94040", c.party, c.name)}
          {/each}
          {#each currentModal.candidates.filter((c) => c.alliance === "UDF") as c}
            {@html createModalCandidate("UDF", "#1565C0", c.party, c.name)}
          {/each}
          {#each currentModal.candidates.filter((c) => c.alliance === "NDA") as c}
            {@html createModalCandidate("NDA", "#E07828", c.party, c.name)}
          {/each}
          {#each currentModal.candidates.filter((c) => c.alliance === "Others") as c}
            {@html createModalCandidate(c.party || "Others", "#33AA55", c.party, c.name)}
          {/each}
        </div>

        {#if currentModal.qid}
          <div class="modal-section-label">
            Historical Results (Lok Sabha)
          </div>
          <HistoricalChart {seriesData} />
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-overlay:not(.open) {
    display: none;
  }

  .modal {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }

  .modal-top {
    height: 4px;
    background: linear-gradient(90deg, var(--ldf), var(--udf), var(--nda));
    border-radius: 12px 12px 0 0;
  }

  .modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    position: relative;
  }

  .modal-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  .modal-title {
    font-family: 'Inter', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--text);
    margin-top: 4px;
  }

  .modal-badges {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .reservation-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 4px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.05em;
  }

  .reservation-badge.sc {
    background: var(--sc-bg);
    color: var(--sc-color);
  }

  .reservation-badge.st {
    background: var(--st-bg);
    color: var(--st-color);
  }

  .modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 6px 12px;
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .modal-close:hover {
    background: var(--bg2);
    color: var(--text);
  }

  .modal-body {
    padding: 20px;
  }

  .modal-section-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 12px;
    margin-top: 20px;
  }

  .modal-section-label:first-child {
    margin-top: 0;
  }

  .modal-candidates {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  :global(.modal-candidate) {
    display: flex;
    background: var(--card2);
    border-radius: 8px;
    overflow: hidden;
    min-height: 70px;
  }

  :global(.modal-alliance-bar) {
    width: 4px;
    flex-shrink: 0;
  }

  :global(.modal-candidate-inner) {
    padding: 10px 12px;
    flex: 1;
  }

  :global(.modal-alliance-label) {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    opacity: 0.7;
  }

  :global(.modal-party) {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 14px;
    margin-top: 2px;
  }

  :global(.modal-candidate-name) {
    font-size: 12px;
    color: var(--text-soft);
    margin-top: 2px;
  }

  :global(.modal-candidate-name.tbd) {
    color: var(--muted);
    font-style: italic;
  }
</style>
