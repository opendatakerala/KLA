<script>
  import { _, currentLang, isLoading } from '../lib/i18n.js';
  import { selectedConstituency, closeModal } from '../stores/constituencyStore.js';
  import { ldfCandidates, udfCandidates, ndaCandidates, othersCandidates, getCandidateName, getConstituencyName } from '../stores/candidateStore.js';
  import { historicalDataStore } from '../stores/historicalStore.js';
  import partyLookup from '../data/party-lookup.json';
  import { getSymbolImage } from '../lib/symbols.js';
  import downloadIcon from '../images/download.svg';
  import shareIcon from '../images/share.svg';
  import { toJpeg } from 'html-to-image';
  import NiyamasabhaChart from './charts/NiyamasabhaChart.svelte';
  import LoksabhaChart from './charts/LoksabhaChart.svelte';
  import Bothsabhas from './charts/Bothsabhas.svelte';
  import ExportTemplate from './ExportTemplate.svelte';

  const ALLIANCE_COLORS = {
    LDF: '#D94040',
    UDF: '#1565C0',
    NDA: '#E07828',
    Others: '#33AA55'
  };

  function getPartySymbol(party) {
    const entry = partyLookup[party];
    if (!entry?.symbol) return null;
    return getSymbolImage(entry.symbol);
  }

  function getCandidateImageUrl(photo) {
    if (!photo) return null;
    return `${import.meta.env.PUBLIC_KLA_API_URL}/api/kla2026/candidate-image/${photo}`;
  }

  function getAffidavitUrl(affidavitId) {
    if (!affidavitId) return null;
    return `https://affidavit.eci.gov.in/affidavit-pdf-download/${affidavitId}`;
  }

  let currentModal = $derived($selectedConstituency);
  let currentLangValue = $derived($currentLang);
  let currentIsLoading = $derived($isLoading);
  
  let ldf = $derived($ldfCandidates);
  let udf = $derived($udfCandidates);
  let nda = $derived($ndaCandidates);
  let others = $derived($othersCandidates);

  function t(key) {
    return currentIsLoading ? key : $_(key);
  }

  let loksabhaVisible = $state(true);

  let historicalData = $derived($historicalDataStore);
  let niyamasabhaData = $derived(historicalData?.data?.niyamasabha || []);
  let loksabhaData = $derived(historicalData?.data?.loksabha || []);
  let historicalLoading = $derived(historicalData?.loading || false);
  let historicalError = $derived(historicalData?.error ? true : false);

  function handleClose() { closeModal(); }

  function handleKeydown(e) {
    if (e.key === 'Escape') handleClose();
  }

  function formatIndian(num) {
    if (!num) return '0';
    const n = parseInt(num, 10);
    return isNaN(n) ? '0' : n.toLocaleString('en-IN');
  }

  let exportTemplate = $state(null);
  let isGenerating = $state(false);
  let generatedBlob = $state(null);
  let lastConstituencyNumber = $state(null);
  let lastLang = $state(null);

  let canShareImage = $state(false);
  let showMergedView = $state(false);

  $effect(() => {
    if (typeof navigator !== 'undefined' && navigator.canShare) {
      canShareImage = navigator.canShare({
        files: [new File([''], 'test.jpg', { type: 'image/jpeg' })]
      });
    }
  });

  function onExportRootReady(el) {
    exportTemplate = el;
    tryStartGeneration();
  }

  function tryStartGeneration() {
    if (currentModal?.number && !generatedBlob && exportTemplate && !historicalLoading) {
      setTimeout(generateImage, 500);
    }
  }

  $effect(() => {
    const constituencyNumber = currentModal?.number;
    const lang = currentLangValue;
    if (constituencyNumber && (lastConstituencyNumber !== constituencyNumber || lastLang !== lang)) {
      generatedBlob = null;
      showMergedView = false;
      lastConstituencyNumber = constituencyNumber;
      lastLang = lang;
    }
  });

  $effect(() => {
    if (!historicalLoading && currentModal?.number) {
      tryStartGeneration();
    }
  });

  async function generateImage() {
      if (!exportTemplate || isGenerating || generatedBlob) return;
      isGenerating = true;
      
      // Give Svelte a tiny bit more breathing room to ensure charts have mounted
      await new Promise(r => setTimeout(r, 100)); 
      
      try {
        // 1. Force explicit dimensions so it doesn't collapse to 0x0
        // We check offsetWidth first, falling back to scrollWidth
        const exportWidth = exportTemplate.offsetWidth || exportTemplate.scrollWidth;
        const exportHeight = exportTemplate.offsetHeight || exportTemplate.scrollHeight;
  
        const configOptions = { 
          backgroundColor: '#1a1a1a',
          pixelRatio: 2,
          width: exportWidth,
          height: exportHeight,
          style: {
                    left: '0px',
                    top: '0px',
                    position: 'static', 
                    transform: 'none',
                    margin: '0'
                  }
        };
  
        // 2. THE WARM-UP PASS (The Magic Fix)
        // We run the generation once and throw away the result. 
        // This forces the browser to load fonts, SVGs, and charts into the canvas cache.
        await toJpeg(exportTemplate, configOptions).catch(() => {});
        
        // 3. THE REAL PASS
        // Now that the browser engine is "warmed up", the second snapshot will capture everything perfectly.
        const dataUrl = await toJpeg(exportTemplate, configOptions);
        
        const response = await fetch(dataUrl);
        generatedBlob = await response.blob();
        
      } catch (err) {
        console.error('Failed to generate image:', err);
      } finally {
        isGenerating = false;
      }
    }

  async function handleShare() {
    if (!generatedBlob) {
      await generateImage();
      if (!generatedBlob) return;
    }
    try {
      const file = new File([generatedBlob], `KLA-${currentModal.number}-${currentModal.name || 'constituency'}.jpg`, { type: 'image/jpeg' });
      const constituencyName = getConstituencyName(currentModal, currentLangValue);
      await navigator.share({
        files: [file],
        title: `KLA 2026 - ${constituencyName}`,
        text: $_('modal.shareText', { values: { constituency: constituencyName } })
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to share:', err);
      }
    }
  }

  async function handleDownload() {
    if (!generatedBlob) {
      await generateImage();
      if (!generatedBlob) return;
    }
    const link = document.createElement('a');
    link.download = `KLA-${currentModal.number}-${currentModal.name || 'constituency'}.jpg`;
    link.href = URL.createObjectURL(generatedBlob);
    link.click();
    URL.revokeObjectURL(link.href);
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if currentModal}
  <div
    class="modal-overlay open"
    onclick={handleClose}
    role="button"
    tabindex="0"
  >
    <div
      class="modal"

      onclick={(e) => e.stopPropagation()}
      role="dialog"

    >
      <div class="modal-top"></div>
      <div class="modal-header">
        <div class="modal-actions">
          {#if generatedBlob}
            {#if canShareImage}
              <button class="modal-btn icon-btn" onclick={handleShare}>
                <img src={shareIcon.src} alt="Share" />
              </button>
            {/if}
            <button class="modal-btn icon-btn" onclick={handleDownload}>
              <img src={downloadIcon.src} alt="Download" />
            </button>
          {:else}
            <button class="modal-btn" disabled>
              <span class="loader"></span>
            </button>
          {/if}
          <button class="modal-btn icon-btn" onclick={handleClose}>
            <span>{$_('modal.close')}</span>
          </button>
        </div>
        <div class="modal-eyebrow">
          {currentLangValue === 'ml' && currentModal.districtMalayalam ? currentModal.districtMalayalam : currentModal.district} · {$_('modal.constituency')} #{currentModal.number}
        </div>
        <div class="modal-title">{getConstituencyName(currentModal, currentLangValue)}</div>
        <div class="modal-badges">
          {#if currentModal.reservation}
            <span class="reservation-badge {currentModal.reservation.toLowerCase()}">
              {currentModal.reservation}
              <span>{$_('modal.reserved')}</span>
            </span>
          {/if}
        </div>
      </div>

      {#if currentModal.pollingBooths || currentModal.votersTotal}
        <div class="constituency-stats">
          {#if currentModal.pollingBooths}
            <div class="stat-card">
              <span class="stat-label">{$_('modal.pollingBooths')}</span>
              <span class="stat-value">{formatIndian(currentModal.pollingBooths)}</span>
            </div>
          {/if}
          {#if currentModal.votersTotal}
            {@const total = parseInt(currentModal.votersTotal) || 0}
            {@const male = parseInt(currentModal.votersMale) || 0}
            {@const female = parseInt(currentModal.votersFemale) || 0}
            {@const trans = parseInt(currentModal.votersTransgender) || 0}
            {@const malePct = total > 0 ? Math.round((male / total) * 100) : 0}
            {@const femalePct = total > 0 ? Math.round((female / total) * 100) : 0}
            {@const transPct = total > 0 ? Math.round((trans / total) * 100) : 0}
            <div class="voters-card">
              <div class="voters-total">
                <span class="stat-label">{$_('modal.voters')}</span>
                <span class="voters-count">{formatIndian(currentModal.votersTotal)}</span>
              </div>
              <div class="voters-bar-wrapper">
                {#if trans > 0}
                  <div class="voters-bar-segment trans" style="width: {transPct}%"></div>
                {/if}
                <div class="voters-bar-segment female" style="width: {femalePct}%"></div>
                <div class="voters-bar-segment male" style="width: {malePct}%"></div>
              </div>
              <div class="voters-legend">
                <span class="legend-item"><span class="legend-dot female"></span> ♀ {formatIndian(female)} ({femalePct}%)</span>
                {#if trans > 0}
                  <span class="legend-item"><span class="legend-dot trans"></span> ⚥ {formatIndian(trans)} ({transPct}%)</span>
                {/if}
                <span class="legend-item"><span class="legend-dot male"></span> ♂ {formatIndian(male)} ({malePct}%)</span>
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <div class="modal-body">
        <div class="modal-section-label">
          {$_('modal.contestingCandidates')}
        </div>

        {#if ldf.length > 0}
          <div class="candidate-group">
            {#each ldf as c}
              <div class="candidate-row">
                {#if c.photo}
                  <div class="candidate-photo">
                    <img src={getCandidateImageUrl(c.photo)} alt="" />
                  </div>
                {/if}
                <div class="alliance-bar" style="background: {ALLIANCE_COLORS.LDF}"></div>
                  <div class="candidate-info">
                    <div class="candidate-details">
                      <div class="alliance-label">LDF</div>
                      <div class="candidate-name" class:tbd={!c.name}>{getCandidateName(c, currentLangValue, currentIsLoading, t)}</div>
                      <div class="candidate-party">{c.party || '—'}</div>
                      {#if c.affidavitId}
                        <a href={getAffidavitUrl(c.affidavitId)} target="_blank" rel="noopener" class="affidavit-btn">Affidavit</a>
                      {/if}
                    </div>
                    <div class="candidate-symbol">
                      {#if getPartySymbol(c.party)}
                        <img src={getPartySymbol(c.party)} alt="" />
                      {:else}
                        <div class="symbol-placeholder"></div>
                      {/if}
                    </div>
                  </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if udf.length > 0}
          <div class="candidate-group">
            {#each udf as c}
              <div class="candidate-row">
                {#if c.photo}
                  <div class="candidate-photo">
                    <img src={getCandidateImageUrl(c.photo)} alt="" />
                  </div>
                {/if}
                <div class="alliance-bar" style="background: {ALLIANCE_COLORS.UDF}"></div>
                <div class="candidate-info">
                  <div class="candidate-details">
                    <div class="alliance-label">UDF</div>
                    <div class="candidate-name" class:tbd={!c.name}>{getCandidateName(c, currentLangValue, currentIsLoading, t)}</div>
                    <div class="candidate-party">{c.party || '—'}</div>
                    {#if c.affidavitId}
                      <a href={getAffidavitUrl(c.affidavitId)} target="_blank" rel="noopener" class="affidavit-btn">Affidavit</a>
                    {/if}
                  </div>
                  <div class="candidate-symbol">
                    {#if getPartySymbol(c.party)}
                      <img src={getPartySymbol(c.party)} alt="" />
                    {:else}
                      <div class="symbol-placeholder"></div>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if nda.length > 0}
          <div class="candidate-group">
            {#each nda as c}
              <div class="candidate-row">
                {#if c.photo}
                  <div class="candidate-photo">
                    <img src={getCandidateImageUrl(c.photo)} alt="" />
                  </div>
                {/if}
                <div class="alliance-bar" style="background: {ALLIANCE_COLORS.NDA}"></div>
                <div class="candidate-info">
                  <div class="candidate-details">
                    <div class="alliance-label">NDA</div>
                    <div class="candidate-name" class:tbd={!c.name}>{getCandidateName(c, currentLangValue, currentIsLoading, t)}</div>
                    <div class="candidate-party">{c.party || '—'}</div>
                    {#if c.affidavitId}
                      <a href={getAffidavitUrl(c.affidavitId)} target="_blank" rel="noopener" class="affidavit-btn">Affidavit</a>
                    {/if}
                  </div>
                  <div class="candidate-symbol">
                    {#if getPartySymbol(c.party)}
                      <img src={getPartySymbol(c.party)} alt="" />
                    {:else}
                      <div class="symbol-placeholder"></div>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if others.length > 0}
          <div class="candidate-group">
            {#each others as c}
              <div class="candidate-row">
                {#if c.photo}
                  <div class="candidate-photo">
                    <img src={getCandidateImageUrl(c.photo)} alt="" />
                  </div>
                {/if}
                <div class="alliance-bar" style="background: {ALLIANCE_COLORS.Others}"></div>
                <div class="candidate-info">
                  <div class="candidate-details">
                    <div class="alliance-label">Others</div>
                    <div class="candidate-name" class:tbd={!c.name}>{getCandidateName(c, currentLangValue, currentIsLoading, t)}</div>
                    <div class="candidate-party">{c.party || '—'}</div>
                    {#if c.affidavitId}
                      <a href={getAffidavitUrl(c.affidavitId)} target="_blank" rel="noopener" class="affidavit-btn">Affidavit</a>
                    {/if}
                  </div>
                  <div class="candidate-symbol">
                    {#if getPartySymbol(c.party)}
                      <img src={getPartySymbol(c.party)} alt="" />
                    {:else}
                      <div class="symbol-placeholder"></div>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Niyamasabha Historical Results -->
        {#if showMergedView}
          <Bothsabhas 
            niyamasabhaData={niyamasabhaData} 
            loksabhaData={loksabhaData}
            onUnmerge={() => showMergedView = false}
          />
        {:else}
          <div class="modal-section-label">
            {$_('modal.historicalResultsNiyamasabha')}
          </div>
          <NiyamasabhaChart constituencyNumber={currentModal.number} data={niyamasabhaData} loading={historicalLoading} error={historicalError} alwaysShowSimple={true} />

          <!-- Lok Sabha Historical Results -->
          {#if currentModal.qid && loksabhaData?.[0]?.parliamentaryConstituency}
            <div class="modal-section-label loksabha-section">
              <button class="toggle-loksabha-btn" onclick={() => loksabhaVisible = !loksabhaVisible}>
                {loksabhaVisible ? '▼' : '▶'} {$_('modal.partOfParliamentaryConstituency', { values: { parliamentaryConstituency: currentLangValue === 'ml' && loksabhaData[0].parliamentaryConstituencyMalayalam ? loksabhaData[0].parliamentaryConstituencyMalayalam : loksabhaData[0].parliamentaryConstituency } })}
              </button>
            </div>
            <div class="loksabha-chart-wrapper" class:hidden={!loksabhaVisible}>
              <LoksabhaChart data={loksabhaData} loading={historicalLoading} error={historicalError} onMergeClick={() => showMergedView = true} />
            </div>
          {/if}
        {/if}
        <div class="modal-footer">
          <a href="/KLA2026/about" class="modal-report-link" title={$_('footer.reportIssues')}>
            ⚠️ {$_('footer.reportIssues')}
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="export-wrapper">
    <ExportTemplate constituency={currentModal} {loksabhaVisible} onRootReady={onExportRootReady} />
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-overlay:not(.open) { display: none; }

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
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  @media (min-width: 480px) {
    .modal-header {
      display: block;
    }

    .modal-actions {
      position: absolute;
      top: 16px;
      right: 16px;
    }
  }

  .modal-eyebrow {
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  .modal-title {
    font-family: 'Manjari', sans-serif;
    font-size: var(--fs-xl);
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
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
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

  .modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .modal-btn {
    padding: 8px 14px;
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--muted);
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-btn.icon-btn {
    padding: 8px;
    min-width: 36px;
    min-height: 36px;
  }

  .modal-btn.icon-btn img {
    width: 20px;
    height: 20px;
  }

  .modal-btn:hover {
    background: var(--bg2);
    color: var(--text);
  }

  .modal-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .loader {
    width: 14px;
    height: 14px;
    border: 2px solid var(--border);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .constituency-stats {
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 14px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    min-width: 80px;
  }

  .stat-label {
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    letter-spacing: 0.08em;
    color: var(--muted);
    text-transform: uppercase;
  }

  .stat-value {
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xl);
    font-weight: 700;
    color: var(--text);
  }

  .stat-breakdown {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    color: var(--muted);
  }

  .voters-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 14px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .voters-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .voters-count {
    font-family: 'Manjari', sans-serif;
    font-size: var(--fs-xl);
    font-weight: 700;
    color: var(--text);
  }

  .voters-bar-wrapper {
    display: flex;
    height: 16px;
    border-radius: 4px;
    overflow: hidden;
    background: var(--bg2);
  }

  .voters-bar-segment {
    height: 100%;
  }

  .voters-bar-segment.male { background: #3B82F6; }
  .voters-bar-segment.female { background: #EC4899; }
  .voters-bar-segment.trans { background: #8B5CF6; }

  .voters-legend {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    color: var(--muted);
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .legend-dot.male { background: #3B82F6; }
  .legend-dot.female { background: #EC4899; }
  .legend-dot.trans { background: #8B5CF6; }

  .modal-body { padding: 20px; }

  .modal-section-label {
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    letter-spacing: 0.08em;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 12px;
    margin-top: 24px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .modal-section-label:first-child { margin-top: 0; }

  .loksabha-section {
    border-bottom: none;
    padding-bottom: 0;
  }

  .loksabha-chart-wrapper.hidden {
    display: none;
  }

  .toggle-loksabha-btn {
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-align: left;
  }

  .toggle-loksabha-btn:hover {
    color: var(--text);
  }

  .candidate-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    margin-bottom: 12px;
  }

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

  .symbol-placeholder {
    width: 40px;
    height: 40px;
  }

  .candidate-photo {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 50%;
  }

  .candidate-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .affidavit-btn {
    display: inline-block;
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

  .modal-footer {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }

  .modal-report-link {
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    color: var(--gold);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: color 0.2s;
  }

  .modal-report-link:hover {
    color: var(--gold-mid);
  }

  .modal-report-link:hover {
    opacity: 1;
  }

  .export-wrapper {
    position: absolute;
    top: 0;
    left: -9999px;
    overflow: hidden;
    width: 1080px;
    height: 1080px;
  }
</style>
