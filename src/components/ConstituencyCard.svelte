<script>
  import { ALLIANCE_COLORS, ALLIANCE_BG } from '../lib/constants.js';

  let { constituency, expanded = $bindable(false), onClick } = $props();

  let candidates = $derived(constituency.candidates);
  let sortedCandidates = $derived([...candidates].sort((a, b) => b.votes - a.votes));
  let leadingCandidate = $derived(sortedCandidates[0]);
  let countingInProgress = $derived(leadingCandidate?.votes === 0);

  function getAllianceColor(alliance) {
    return ALLIANCE_COLORS[alliance] || ALLIANCE_COLORS.Others;
  }

  function getAllianceBg(alliance) {
    return ALLIANCE_BG[alliance] || ALLIANCE_BG.Others;
  }

  function formatVotes(votes) {
    return Number(votes).toLocaleString('en-IN');
  }

  function handleClick() {
    onClick();
  }
</script>

<div class="constituency-card" class:expanded onclick={handleClick}>
  <div class="card-header">
    <span class="constituency-number">{constituency.constituency.constituency_Number}</span>
    <div class="constituency-info">
      <h3 class="constituency-name">{constituency.constituency.constituency_Name}</h3>
      <span class="constituency-district">{constituency.constituency.district}</span>
    </div>
    <span class="expand-icon">{expanded ? '−' : '+'}</span>
  </div>

  {#if !expanded}
    <div class="card-body">
      {#if countingInProgress}
        <div class="counting-status">
          <span class="counting-badge">Counting in progress</span>
        </div>
      {:else}
        <div class="leading-candidate">
          <div class="candidate-name">{leadingCandidate.name}</div>
          {#if leadingCandidate.name_ml}
            <div class="candidate-name-ml">{leadingCandidate.name_ml}</div>
          {/if}
          <div class="candidate-details">
            <span class="candidate-party">{leadingCandidate.party}</span>
            <span class="candidate-alliance" style="background: {getAllianceBg(leadingCandidate.alliance)}; color: {getAllianceColor(leadingCandidate.alliance)}">
              {leadingCandidate.alliance}
            </span>
          </div>
          <div class="candidate-votes">{formatVotes(leadingCandidate.votes)} votes</div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="detail-section">
      <div class="detail-info">
        <div class="info-item">
          <span class="info-label">Region</span>
          <span class="info-value">{constituency.constituency.region}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Total Voters</span>
          <span class="info-value">{formatVotes(constituency.constituency['Voters Total'])}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Polling %</span>
          <span class="info-value">{constituency.constituency['Polling % (2026)']}%</span>
        </div>
      </div>

      <h4 class="candidates-title">Candidates</h4>

      <div class="candidates-table">
        <div class="table-header">
          <span class="col-rank">#</span>
          <span class="col-candidate">Candidate</span>
          <span class="col-party">Party</span>
          <span class="col-alliance">Alliance</span>
          <span class="col-votes">Votes</span>
        </div>
        {#each sortedCandidates as candidate, index}
          <div class="table-row" style="border-left: 4px solid {getAllianceColor(candidate.alliance)}">
            <span class="col-rank">{index + 1}</span>
            <span class="col-candidate">
              <span class="candidate-name">{candidate.name}</span>
              {#if candidate.name_ml}
                <span class="candidate-name-ml">{candidate.name_ml}</span>
              {/if}
            </span>
            <span class="col-party">{candidate.party}</span>
            <span class="col-alliance">
              <span class="alliance-badge" style="background: {getAllianceBg(candidate.alliance)}; color: {getAllianceColor(candidate.alliance)}">
                {candidate.alliance}
              </span>
            </span>
            <span class="col-votes">{formatVotes(candidate.votes)}</span>
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

  .expand-icon {
    font-size: var(--fs-lg);
    color: var(--muted);
    font-weight: 600;
    flex-shrink: 0;
    width: 24px;
    text-align: center;
  }

  .card-body {
    padding-left: 44px;
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
    padding: 10px 12px;
    background: var(--card2);
    border-radius: 8px;
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
    margin-bottom: 4px;
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

  .candidates-title {
    font-size: var(--fs-md);
    font-weight: 600;
    color: var(--text);
    margin-bottom: 12px;
  }

  .candidates-table {
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .table-header {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    background: var(--card2);
    font-size: var(--fs-xs);
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
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
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .candidate-name {
    font-size: var(--fs-sm);
    font-weight: 500;
    color: var(--text);
  }

  .candidate-name-ml {
    font-size: var(--fs-xs);
    color: var(--muted);
  }

  .col-party {
    width: 180px;
    font-size: var(--fs-sm);
    color: var(--text-soft);
  }

  .col-alliance {
    width: 80px;
  }

  .alliance-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: var(--fs-xs);
    font-weight: 600;
    text-transform: uppercase;
  }

  .col-votes {
    width: 80px;
    text-align: right;
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--text);
  }

  @media (max-width: 768px) {
    .constituency-card.expanded {
      padding: 12px;
    }

    .detail-info {
      flex-direction: column;
      gap: 12px;
    }

    .col-party {
      display: none;
    }

    .col-alliance {
      width: auto;
    }

    .col-votes {
      width: 70px;
    }
  }
</style>
