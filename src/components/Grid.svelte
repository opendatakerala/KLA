<script>
  import { _, currentLang, isLoading } from '../lib/i18n.js';
  import { filteredConstituencies, openModal } from '../stores/constituencyStore.js';
  import { getCandidateName as getCandName } from '../stores/candidateStore.js';
  import Modal from './Modal.svelte';

  let filteredData = $derived($filteredConstituencies);
  let currentLangValue = $derived($currentLang);
  let currentIsLoading = $derived($isLoading);

  let t = (key) => currentIsLoading ? key : $_(key);

  function getCandidateName(candidate) {
    return getCandName(candidate, currentLangValue, currentIsLoading, t);
  }

  function getAllianceClass(alliance) {
    if (alliance === "LDF") return "LDF";
    if (alliance === "UDF") return "UDF";
    if (alliance === "NDA") return "NDA";
    return "OTH";
  }

  function getAllianceLabel(alliance) {
    return alliance === "OTH" ? "Others" : alliance;
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
          <div class="card-num">{$_('modal.constituency')} #{row.number}</div>
          <div class="card-name">{currentLangValue === 'ml' && row.nameMalayalam ? row.nameMalayalam : row.name}</div>
          <div class="card-district">{currentLangValue === 'ml' && row.districtMalayalam ? row.districtMalayalam : row.district}</div>
        </div>
        {#if row.reservation}
          <span class="reservation-badge {row.reservation.toLowerCase()}">
            {row.reservation}
            <span>{t('modal.reserved')}</span>
          </span>
        {/if}
      </div>
      <div class="card-candidates">
        {#each row.candidates.filter((c) => c.alliance === "LDF") as c}
          <div class="candidate-row">
            <span class="alliance-tag {getAllianceClass('LDF')}">{getAllianceLabel('LDF')}</span>
            <div>
              <span class="candidate-name">{getCandidateName(c)}</span>
              <div class="candidate-party">{c.party || "—"}</div>
            </div>
          </div>
        {/each}
        {#each row.candidates.filter((c) => c.alliance === "UDF") as c}
          <div class="candidate-row">
            <span class="alliance-tag {getAllianceClass('UDF')}">{getAllianceLabel('UDF')}</span>
            <div>
              <span class="candidate-name">{getCandidateName(c)}</span>
              <div class="candidate-party">{c.party || "—"}</div>
            </div>
          </div>
        {/each}
        {#each row.candidates.filter((c) => c.alliance === "NDA") as c}
          <div class="candidate-row">
            <span class="alliance-tag {getAllianceClass('NDA')}">{getAllianceLabel('NDA')}</span>
            <div>
              <span class="candidate-name">{getCandidateName(c)}</span>
              <div class="candidate-party">{c.party || "—"}</div>
            </div>
          </div>
        {/each}
      </div>
      <div class="card-more">
        <span>{t('results.moreInfo')}</span>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 4l4 4-4 4"/></svg>
      </div>
    </div>
  {/each}

  {#if filteredData.length === 0}
    <div class="empty-state">
      <span>{t('results.empty')}</span>
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
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  .card-name {
    font-family: 'Manjari', sans-serif;
    font-weight: 600;
    font-size: var(--fs-lg);
    color: var(--text);
    margin-top: 2px;
  }

  .card-district {
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
    color: var(--muted);
    margin-top: 2px;
  }

  .reservation-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 6px;
    border-radius: 4px;
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
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

  .candidate-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .alliance-tag {
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    font-weight: 600;
    padding: 2px 5px;
    border-radius: 3px;
    letter-spacing: 0.05em;
    min-width: 32px;
    text-align: center;
  }

  .alliance-tag.LDF {
    background: #ffebee;
    color: #EE0000;
  }

  .alliance-tag.UDF {
    background: #e3f2fd;
    color: #0078FF;
  }

  .alliance-tag.NDA {
    background: #fff3e0;
    color: #FF9933;
  }

  .alliance-tag.OTH {
    background: var(--card2);
    color: var(--muted);
  }

  .candidate-party {
    font-family: 'Manjari', sans-serif;
    font-size: var(--fs-xs);
    color: var(--muted);
  }

  .candidate-name {
    font-size: var(--fs-sm);
    font-weight: 500;
    color: var(--text);
  }

  .card-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding-top: 10px;
    margin-top: 8px;
    border-top: 1px solid var(--border);
    color: var(--muted);
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
  }

  .card-more svg {
    width: 12px;
    height: 12px;
  }

  @media (min-width: 768px) {
    .card-more {
      display: none;
    }
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px;
    color: var(--muted);
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
  }
</style>
