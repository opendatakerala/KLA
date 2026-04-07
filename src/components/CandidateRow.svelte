<script>
  import { getCandidateSymbol } from '../lib/symbols.js';
  import { getCandidateName } from '../stores/candidateStore.js';

  let { candidate, allianceLabel, allianceColor, langValue, isLoading, t, pdfIcon = null } = $props();

  function getAffidavitUrl(affidavitId) {
    if (!affidavitId) return null;
    return `https://affidavit.eci.gov.in/affidavit-pdf-download/${affidavitId}`;
  }
</script>

<div class="candidate-row">
  <div class="alliance-bar" style="background: {allianceColor}"></div>
  <div class="candidate-info">
    <div class="candidate-details">
      <div class="alliance-label">{allianceLabel}</div>
      <div class="candidate-name" class:tbd={!candidate.name}>{getCandidateName(candidate, langValue, isLoading, t)}</div>
      <div class="candidate-party">{candidate.party || '—'}</div>
      {#if pdfIcon && candidate.affidavitId}
        <a href={getAffidavitUrl(candidate.affidavitId)} target="_blank" rel="noopener" class="affidavit-btn"><img src={pdfIcon.src} alt="" /> {t('modal.affidavit')}</a>
      {/if}
    </div>
    <div class="candidate-symbol">
      {#if candidate.symbol}
        {#await getCandidateSymbol(candidate.symbol)}
        {:then symbolSrc}
          {#if symbolSrc}
            <img src={symbolSrc} alt="" />
          {/if}
        {/await}
      {/if}
    </div>
  </div>
</div>

<style>
  .candidate-row {
    display: flex;
    background: var(--card2);
    border-radius: 8px;
    overflow: hidden;
    min-height: 70px;
  }

  .alliance-bar {
    width: 4px;
    height: 60px;
    flex-shrink: 0;
  }

  .candidate-info {
    padding: 10px 12px;
    flex: 1;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .candidate-details {
    flex: 1;
    min-width: 0;
  }

  .candidate-symbol {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .candidate-symbol img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .affidavit-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    padding: 2px 6px;
    font-family: 'Manjari', monospace;
    font-size: 10px;
    color: var(--gold);
    background: var(--bg2);
    border: 1px solid var(--gold);
    border-radius: 3px;
    text-decoration: none;
    transition: all 0.15s;
  }

  .affidavit-btn img {
    width: 12px;
    height: 12px;
    object-fit: contain;
  }

  .affidavit-btn:hover {
    background: var(--gold);
    color: var(--card);
  }

  .alliance-label {
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    font-weight: 600;
    letter-spacing: 0.1em;
    opacity: 0.7;
  }

  .candidate-name {
    font-family: 'Manjari', sans-serif;
    font-weight: 600;
    font-size: var(--fs-base);
    margin-top: 2px;
    color: #000;
  }

  .candidate-party {
    font-size: var(--fs-sm);
    color: var(--text-soft);
    margin-top: 2px;
  }

  .candidate-name.tbd {
    color: var(--muted);
    font-style: italic;
  }
</style>
