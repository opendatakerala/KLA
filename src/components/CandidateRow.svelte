<script>
  import { getCandidateSymbol } from '../lib/symbols.js';
  import { getCandidateName } from '../stores/candidateStore.js';

  const candidatePhotos = import.meta.glob('../images/candidate_photos/*.jpg');

  let { candidate, allianceLabel, allianceColor, langValue, isLoading, t, pdfIcon = null, manifestoUrl = null } = $props();

  let showPdf = $state(false);

  function getArchiveEmbedUrl(archiveUrl) {
    if (!archiveUrl) return null;
    return `https://archive.org/embed/${archiveUrl}`;
  }

  function getArchivePdfUrl(archiveUrl) {
    if (!archiveUrl) return null;
    const pdfPart = archiveUrl.replace('mlat.', '');
    return `https://archive.org/download/${archiveUrl}/kl-elec-2026.${pdfPart}.pdf`;
  }

  function getPhotoSrc(reference) {
    if (!reference) return null;
    const key = `../images/candidate_photos/${reference}.jpg`;
    const loader = candidatePhotos[key];
    if (!loader) return null;
    return loader().then(m => m.default?.src);
  }
</script>

{#if showPdf && candidate.archiveUrl}
  <div class="pdf-overlay" onclick={() => showPdf = false}>
    <div class="pdf-popup" onclick={(e) => e.stopPropagation()}>
      <button class="pdf-close" onclick={() => showPdf = false}>&times;</button>
      <iframe src={getArchiveEmbedUrl(candidate.archiveUrl)} width="560" height="70vh" frameborder="0" allowfullscreen></iframe>
    </div>
  </div>
{/if}

<div class="candidate-row">
  <div class="alliance-bar" style="background: {allianceColor}"></div>
  <div class="candidate-info">
    {#if candidate.reference}
      {#await getPhotoSrc(candidate.reference)}
        <div class="candidate-photo-placeholder"></div>
      {:then photoSrc}
        {#if photoSrc}
          <img src={photoSrc} alt="" class="candidate-photo" />
        {/if}
      {/await}
    {/if}
    <div class="candidate-details">
      <div class="alliance-label">{allianceLabel}</div>
      <div class="candidate-name" class:tbd={!candidate.name}>{getCandidateName(candidate, langValue, isLoading, t)}</div>
      <div class="candidate-party">{candidate.party || '—'}</div>
      {#if pdfIcon && candidate.archiveUrl}
        <button class="affidavit-btn" onclick={() => showPdf = true}><img src={pdfIcon.src} alt="" /> {t('modal.affidavit')}</button>
      {/if}
      {#if pdfIcon && manifestoUrl}
        <a href={manifestoUrl} target="_blank" rel="noopener" class="affidavit-btn"><img src={pdfIcon.src} alt="" /> {t('modal.manifesto')}</a>
      {/if}
    </div>
    <div class="candidate-symbol">
      {#if candidate.symbol}
        {#await getCandidateSymbol(candidate.symbol)}
        {:then symbolSrc}
          {#if symbolSrc}
            <img src={symbolSrc} alt="" title={candidate.symbol} />
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

  .candidate-photo {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .candidate-photo-placeholder {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--bg2);
    flex-shrink: 0;
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

  .pdf-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .pdf-popup {
    position: relative;
    background: var(--card);
    border-radius: 8px;
    padding: 8px;
    width: 90%;
    max-width: 560px;
    max-height: 90vh;
    overflow: auto;
  }

  .pdf-popup iframe {
    width: 100%;
    max-width: 560px;
    min-width: 300px;
    height: 70vh;
    border-radius: 4px;
    display: block;
  }

  .pdf-close {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--gold);
    color: var(--card);
    border: none;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
