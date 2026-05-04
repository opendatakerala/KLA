<script>
  import { ALLIANCE_COLORS, ALLIANCE_BG } from '../lib/constants.js';

  const candidatePhotos = import.meta.glob('../images/candidate_photos/*.jpg');

  let { constituency, lang = 'en', expanded = $bindable(false), onClick } = $props();

  let isMalayalam = $derived(lang === 'ml');

  let candidates = $derived(constituency.candidates);
  let sortedCandidates = $derived([...candidates].sort((a, b) => b.votes - a.votes));
  let leadingCandidate = $derived(sortedCandidates[0]);
  let secondCandidate = $derived(sortedCandidates[1]);
  let countingInProgress = $derived(leadingCandidate?.votes === 0);
  let overallMargin = $derived(sortedCandidates.length > 1 ? sortedCandidates[0].votes - sortedCandidates[1].votes : 0);
  let totalPolled = $derived(Math.round((constituency.constituency['Voters Total'] || 0) * (constituency.constituency['Polling % (2026)'] || 0) / 100));
  let countedVotes = $derived(candidates.reduce((sum, c) => sum + c.votes, 0));
  let countedPct = $derived(totalPolled > 0 ? (countedVotes / totalPolled * 100).toFixed(1) : '0.0');

  let constituencyName = $derived(isMalayalam
    ? constituency.constituency['constituency_Name_ (Malayalam)'] || constituency.constituency.constituency_Name
    : constituency.constituency.constituency_Name
  );

  let roundsCompleted = $derived(constituency.constituency.roundlist?.completed_rounds ?? 0);
  let roundsTotal = $derived(constituency.constituency.roundlist?.total_rounds ?? 0);
  let resultDeclared = $derived(constituency.constituency.resultDeclared !== 'NO');

  function getPhotoSrc(reference) {
    if (!reference) return null;
    const key = `../images/candidate_photos/${reference}`;
    const loader = candidatePhotos[key];
    if (!loader) return null;
    return loader().then(m => m.default?.src);
  }

  function getAllianceColor(alliance) {
    return ALLIANCE_COLORS[alliance] || ALLIANCE_COLORS.Others;
  }

  function getAllianceBg(alliance) {
    return ALLIANCE_BG[alliance] || ALLIANCE_BG.Others;
  }

  function formatVotes(votes) {
    return Number(votes).toLocaleString('en-IN');
  }

  function getVoteShare(votes) {
    if (!totalPolled || !votes) return 0;
    return (votes / totalPolled) * 100;
  }

  function handleClick() {
    onClick();
  }
</script>

<div class="constituency-card" class:expanded onclick={handleClick}>
  <div class="card-header">
    <span class="constituency-number">{constituency.constituency.constituency_Number}</span>
    <div class="constituency-info">
      <h3 class="constituency-name">{constituencyName} <span class="rounds-info">Rounds {roundsCompleted}/{roundsTotal}</span></h3>
      <span class="constituency-district">{constituency.constituency.district}</span>
    </div>
    <span class="expand-icon">{expanded ? '−' : '+'}</span>
    {#if resultDeclared}
      <span class="declared-badge">Declared</span>
    {/if}
  </div>

  {#if !expanded}
    <div class="card-body">
      {#if countingInProgress}
        <div class="counting-status">
          <span class="counting-badge">Counting in progress</span>
        </div>
      {:else}
        <div class="leading-candidate">
          {#if leadingCandidate.photo}
            {#await getPhotoSrc(leadingCandidate.photo)}
              <div class="candidate-photo-placeholder"></div>
            {:then photoSrc}
              {#if photoSrc}
                <img src={photoSrc} alt="" class="candidate-photo" />
              {:else}
                <div class="candidate-photo-placeholder"></div>
              {/if}
            {/await}
          {/if}
          <div class="leading-candidate-info">
            <div class="candidate-name">{isMalayalam && leadingCandidate.name_ml ? leadingCandidate.name_ml : leadingCandidate.name}
              {#if resultDeclared}
                <span class="won-badge">WON</span>
              {/if}
            </div>
            {#if !isMalayalam && leadingCandidate.name_ml}
              <div class="candidate-name-ml">{leadingCandidate.name_ml}</div>
            {/if}
            <div class="candidate-details">
              <span class="candidate-party">{leadingCandidate.party}</span>
              <span class="candidate-alliance" style="background: {getAllianceBg(leadingCandidate.alliance)}; color: {getAllianceColor(leadingCandidate.alliance)}">
                {leadingCandidate.alliance}
              </span>
            </div>
            <div class="candidate-votes">
              <span class="votes-count">{formatVotes(leadingCandidate.votes)} votes</span>
              <span class="votes-margin">+{formatVotes(overallMargin)}</span>
            </div>
            <div class="leading-vote-bar-wrapper">
              <div class="vote-share-bar-container leading-vote-bar">
                {#if secondCandidate}
                  <div class="runner-up-marker" style="margin-right: {100 - getVoteShare(secondCandidate.votes)}%; background: {getAllianceColor(secondCandidate.alliance)}"></div>
                {/if}
                <div class="vote-share-bar" style="width: {getVoteShare(leadingCandidate.votes)}%; background: {getAllianceColor(leadingCandidate.alliance)}"></div>
              </div>
              {#if secondCandidate}
                <div class="runner-up-alliance-label" style="right: {100 - getVoteShare(secondCandidate.votes)}%; background: {getAllianceColor(secondCandidate.alliance)}; --label-color: {getAllianceColor(secondCandidate.alliance)}">{secondCandidate.alliance}</div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="detail-section">
      <div class="detail-info">
        <div class="info-item">
          <span class="info-label">Total Voters</span>
          <span class="info-value">{formatVotes(constituency.constituency['Voters Total'])}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Polling %</span>
          <span class="info-value">{constituency.constituency['Polling % (2026)']}%</span>
        </div>
        <div class="info-item">
          <span class="info-label">Estimated Total Votes</span>
          <span class="info-value">{formatVotes(totalPolled)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Counted Votes</span>
          <span class="info-value">{formatVotes(countedVotes)} ({countedPct}%) - Rounds {roundsCompleted}/{roundsTotal}</span>
        </div>
      </div>

      <div class="candidates-table">
        {#each sortedCandidates as candidate, index}
          {@const displayName = isMalayalam && candidate.name_ml ? candidate.name_ml : candidate.name}
          {@const secondaryName = !isMalayalam && candidate.name_ml ? candidate.name_ml : null}
          <div class="table-row" style="border-left: 4px solid {getAllianceColor(candidate.alliance)}">
            <span class="col-rank">{index + 1}</span>
            <span class="col-candidate">
              <div class="candidate-name-group">
                {#if candidate.photo}
                  {#await getPhotoSrc(candidate.photo)}
                    <div class="table-photo-placeholder"></div>
                  {:then photoSrc}
                    {#if photoSrc}
                      <img src={photoSrc} alt="" class="table-photo" />
                    {:else}
                      <div class="table-photo-placeholder"></div>
                    {/if}
                  {/await}
                {/if}
                <div class="candidate-text">
                  <span class="candidate-name">{displayName}{#if index === 0 && resultDeclared} <span class="won-badge">WON</span>{/if}</span>
                  {#if secondaryName}
                    <span class="candidate-name-ml">{secondaryName}</span>
                  {/if}
                </div>
              </div>
              <div class="vote-share-bar-container">
                <div class="vote-share-bar" style="width: {getVoteShare(candidate.votes)}%; background: {getAllianceColor(candidate.alliance)}"></div>
              </div>
            </span>
            <span class="col-party-alliance">
              <span class="party-name">{candidate.party}</span>
              <span class="alliance-badge" style="background: {getAllianceBg(candidate.alliance)}; color: {getAllianceColor(candidate.alliance)}">
                {candidate.alliance}
              </span>
            </span>
            <span class="col-votes">
              <span class="votes-count">{formatVotes(candidate.votes)} <span class="votes-pct">({getVoteShare(candidate.votes).toFixed(1)}%)</span></span>
              {#if index === 0 && sortedCandidates.length > 1}
                <span class="votes-margin">+{formatVotes(overallMargin)}</span>
              {/if}
            </span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .constituency-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .constituency-card:hover {
    border-color: var(--gold-mid);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .constituency-card.expanded {
    grid-column: 1 / -1;
    cursor: default;
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
    position: relative;
  }

  .constituency-number {
    font-size: var(--fs-lg);
    font-weight: 700;
    color: var(--muted);
    min-width: 32px;
    text-align: center;
    line-height: 1;
  }

  .constituency-info {
    flex: 1;
    min-width: 0;
  }

  .constituency-name {
    font-size: var(--fs-md);
    font-weight: 600;
    color: var(--text);
    margin: 0 0 2px 0;
  }

  .constituency-district {
    font-size: var(--fs-xs);
    color: var(--muted);
  }

  .rounds-info {
    font-size: var(--fs-xs);
    color: var(--muted);
    font-weight: 500;
    margin-left: 8px;
  }

  .declared-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    font-size: var(--fs-xs);
    font-weight: 700;
    padding: 3px 10px;
    background: linear-gradient(135deg, #DAA520, #B8860B);
    color: #fff;
    border: 2.5px dashed #8B6914;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transform: rotate(4deg);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .won-badge {
    font-size: var(--fs-xs);
    font-weight: 700;
    padding: 2px 8px;
    background: linear-gradient(135deg, #DAA520, #B8860B);
    color: #fff;
    border: 2px dashed #8B6914;
    border-radius: 2px;
    text-transform: uppercase;
    margin-left: 8px;
    letter-spacing: 0.5px;
    vertical-align: middle;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  }

  .expand-icon {
    font-size: var(--fs-lg);
    color: var(--muted);
    font-weight: 600;
    flex-shrink: 0;
    width: 24px;
    text-align: center;
  }

  .card-body {
  }

  .counting-status {
    display: flex;
    align-items: center;
  }

  .counting-badge {
    display: inline-block;
    padding: 4px 12px;
    background: var(--gold-light);
    color: var(--gold);
    font-size: var(--fs-sm);
    font-weight: 500;
    border-radius: 6px;
  }

  .leading-candidate {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: var(--card2);
    border-radius: 8px;
  }

  .leading-candidate-info {
    flex: 1;
    min-width: 0;
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
    background: var(--border);
    flex-shrink: 0;
  }

  .candidate-name {
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--text);
    margin-bottom: 2px;
  }

  .candidate-name-ml {
    font-size: var(--fs-xs);
    color: var(--muted);
  }

  .candidate-details {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .candidate-party {
    font-size: var(--fs-xs);
    color: var(--text-soft);
  }

  .candidate-alliance {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: var(--fs-xs);
    font-weight: 600;
    text-transform: uppercase;
  }

  .candidate-votes {
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--gold);
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: flex-end;
  }

  .votes-count {
    font-weight: 600;
    color: var(--gold);
  }

  .votes-pct {
    font-size: var(--fs-xs);
    color: var(--muted);
    font-weight: 500;
  }

  .votes-margin {
    font-size: var(--fs-xs);
    font-weight: 700;
    color: var(--muted);
  }

  .leading-vote-bar-wrapper {
    position: relative;
  }

  .runner-up-alliance-label {
    position: absolute;
    top: 100%;
    padding: 1px 6px;
    margin-top: 4px;
    font-size: 10px;
    font-weight: 600;
    color: #fff;
    text-transform: uppercase;
    width: fit-content;
  }

  .runner-up-alliance-label::before {
    content: '';
    position: absolute;
    top: -4px;
    right: 0px;
    border-left: 4px solid transparent;
    border-bottom: 4px solid var(--label-color);
  }

  .vote-share-bar-container {
    width: 100%;
    height: 16px;
    background: var(--border);
    border-radius: 8px;
    overflow: hidden;
    margin-top: 4px;
  }

  .vote-share-bar {
    height: 100%;
    border-radius: 8px;
    transition: width 0.3s ease;
    min-width: 0;
  }

  .leading-vote-bar {
    position: relative;
    overflow: hidden;
  }

  .leading-vote-bar .vote-share-bar {
    position: relative;
  }

  .runner-up-marker {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 3px;
    z-index: 2;
  }

  .detail-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }

  .detail-info {
    display: flex;
    gap: 24px;
    margin-bottom: 20px;
    padding: 12px 16px;
    background: var(--card2);
    border-radius: 8px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .info-label {
    font-size: var(--fs-xs);
    color: var(--muted);
  }

  .info-value {
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--text);
  }

  .candidates-table {
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .table-row {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .table-row:hover {
    background: var(--card2);
  }

  .col-rank {
    width: 32px;
    font-size: var(--fs-sm);
    color: var(--muted);
    font-weight: 600;
  }

  .col-candidate {
    flex: 2;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .candidate-name-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .col-candidate .vote-share-bar-container {
    width: 100%;
  }

  .candidate-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .table-photo {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .table-photo-placeholder {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--border);
    flex-shrink: 0;
  }

  .col-party-alliance {
    width: 180px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .party-name {
    font-size: var(--fs-sm);
    color: var(--text-soft);
  }

  .alliance-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: var(--fs-xs);
    font-weight: 600;
    text-transform: uppercase;
    width: fit-content;
  }

  .col-votes {
    width: 80px;
    text-align: right;
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--text);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  @media (max-width: 768px) {
    .constituency-card.expanded {
      padding: 12px;
    }

    .detail-info {
      flex-direction: column;
      gap: 12px;
    }

    .candidates-table {
      border: none;
      border-radius: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .table-row {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 0 0 12px;
      border-bottom: 1px solid var(--border);
      border-left: none !important;
      gap: 4px;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .col-rank {
      display: none;
    }

    .col-candidate {
      width: 100%;
      flex: unset;
    }

    .candidate-name-group {
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }

    .candidate-name-group .table-photo,
    .candidate-name-group .table-photo-placeholder {
      width: 28px;
      height: 28px;
    }

    .col-party-alliance {
      width: 100%;
      flex-direction: row;
      gap: 8px;
    }

    .col-votes {
      width: 100%;
      text-align: left;
      font-size: var(--fs-xl);
      font-weight: 700;
      color: var(--gold);
      flex-direction: row;
      align-items: baseline;
      gap: 8px;
    }

    .col-votes .votes-count {
      font-size: var(--fs-lg);
    }

    .col-votes .votes-margin {
      font-size: var(--fs-base);
      color: var(--muted);
    }
  }
</style>
