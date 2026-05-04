<script>
  import { ALLIANCE_COLORS, ALLIANCE_BG } from '../lib/constants.js';

  const candidatePhotos = import.meta.glob('../images/candidate_photos/*.jpg');

  let { constituency, lang = 'en', expanded = $bindable(false), onClick } = $props();

  let isMalayalam = $derived(lang === 'ml');

  let candidates = $derived(constituency.candidates);
  let sortedCandidates = $derived([...candidates].sort((a, b) => b.votes - a.votes));
  let leadingCandidate = $derived(sortedCandidates[0]);
  let countingInProgress = $derived(leadingCandidate?.votes === 0);
  let overallMargin = $derived(sortedCandidates.length > 1 ? sortedCandidates[0].votes - sortedCandidates[1].votes : 0);
  let totalPolled = $derived(candidates.reduce((sum, candidate) => sum + candidate.votes, 0));
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

  let allianceVotes = $derived.by(() => {
    const votesByAlliance = {};
    for (const c of candidates) {
      const alliance = ['LDF', 'UDF', 'NDA'].includes(c.alliance) ? c.alliance : 'Others';
      votesByAlliance[alliance] = (votesByAlliance[alliance] || 0) + c.votes;
    }
    const countedTotal = Object.values(votesByAlliance).reduce((sum, v) => sum + v, 0);
    const total = roundsCompleted === roundsTotal ? countedTotal : totalPolled;
    const entries = Object.entries(votesByAlliance).map(([alliance, votes]) => ({
      alliance,
      votes,
      pct: total > 0 ? (votes / total) * 100 : 0,
    }));
    return entries.sort((a, b) => b.votes - a.votes);
  });

  let remainingPct = $derived.by(() => {
    if (roundsCompleted === roundsTotal) return 0;
    const countedTotal = candidates.reduce((sum, c) => sum + c.votes, 0);
    if (!totalPolled) return 0;
    return Math.max(0, ((totalPolled - countedTotal) / totalPolled) * 100);
  });

  function handleClick() {
    onClick();
  }
</script>

<div class="constituency-card" class:expanded onclick={handleClick}>
  <div class="card-header">
    <div class="constituency-info">
      <span class="constituency-district">{constituency.constituency.district}</span>
      <h3 class="constituency-name">{constituencyName}</h3>
      <span class="rounds-info">AC No. {constituency.constituency.constituency_Number} &middot; Rounds {roundsCompleted}/{roundsTotal}</span>
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
              <span class="candidate-alliance" style="background: {getAllianceBg(leadingCandidate.alliance)}; color: {getAllianceColor(leadingCandidate.alliance)}">
                {leadingCandidate.alliance}
              </span>
              <span class="candidate-party">{leadingCandidate.party}</span>
            </div>
            <div class="candidate-votes">
              <span class="votes-count">{formatVotes(leadingCandidate.votes)} votes</span>
              <span class="votes-margin">+{formatVotes(overallMargin)}</span>
            </div>
            <div class="alliance-vote-bar">
              {#each allianceVotes as allianceVote}
                <div class="alliance-vote-segment" style="width: {allianceVote.pct}%; background: {getAllianceColor(allianceVote.alliance)}"></div>
              {/each}
              {#if remainingPct > 0}
                <div class="alliance-vote-segment remaining" style="width: {remainingPct}%"></div>
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
          <span class="info-label">Counted Votes</span>
          <span class="info-value">{formatVotes(countedVotes)}{#if roundsCompleted !== roundsTotal && Number(countedPct) <= 100} ({countedPct}%){/if} - Rounds {roundsCompleted}/{roundsTotal}</span>
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
                  <span class="candidate-name">
                {displayName}
                {#if index === 0 && resultDeclared}
                  <span class="won-badge">WON</span>
                {/if}
                {#if candidate.sitting === 'YES'}
                  <span class="sitting-mla-badge">SITTING MLA</span>
                {/if}
                {#if candidate.sitting === 'YES (Party Change)'}
                  <span class="sitting-mla-badge">SITTING MLA (DIFFERENT PARTY)</span>
                {/if}
                {#if candidate.sitting === 'YES (Seat Change)'}
                  <span class="sitting-mla-badge">SITTING MLA (DIFFERENT SEAT)</span>
                {/if}
              </span>
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

  .constituency-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
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
  }

  .declared-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    background: linear-gradient(135deg, #DAA520, #B8860B);
    color: #fff;
    border: 1.5px dashed #8B6914;
    border-radius: 2px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transform: rotate(4deg);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  }

  .won-badge {
    font-size: 9px;
    font-weight: 700;
    padding: 1px 5px;
    background: linear-gradient(135deg, #DAA520, #B8860B);
    color: #fff;
    border: 1.5px dashed #8B6914;
    border-radius: 2px;
    text-transform: uppercase;
    margin-left: 6px;
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

  .alliance-vote-bar {
    width: 100%;
    height: 8px;
    display: flex;
    border-radius: 4px;
    overflow: hidden;
    background: var(--border);
    margin-top: 6px;
  }

  .alliance-vote-segment {
    height: 100%;
    transition: width 0.3s ease;
  }

  .alliance-vote-segment.remaining {
    background: transparent;
  }

  .vote-share-bar-container {
    width: 100%;
    height: 8px;
    background: var(--border);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 4px;
  }

  .vote-share-bar {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
    min-width: 0;
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

  .sitting-mla-badge {
    background: var(--gold);
    color: var(--card);
    font-size: 9px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 2px;
    margin-left: 6px;
    letter-spacing: 0.5px;
    vertical-align: middle;
    text-transform: uppercase;
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

    .declared-badge {
      font-size: 7px;
      padding: 1px 4px;
      border-width: 1px;
    }

    .won-badge {
      font-size: 7px;
      padding: 0px 4px;
      border-width: 1px;
      margin-left: 4px;
    }
  }
</style>
