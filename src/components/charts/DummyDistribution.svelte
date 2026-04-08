<script>
  import { _, currentLang } from '../../lib/i18n.js';
  import { setSelectedConstituencyById } from '../../stores/constituencyStore.js';
  import { getCandidateName, getConstituencyName, getDistrictName } from '../../stores/candidateStore.js';
  import { aparanStore } from '../../stores/aparanStore.js';
  import { setConstituencyHash } from '../../stores/routerStore.js';

  const { isActive = false } = $props();

  const ALLIANCES = ['LDF', 'UDF', 'NDA'];

  let activeAlliance = $state('LDF');

  let aparanData = $derived($aparanStore);
  let lang = $derived($currentLang);
  let totalCandidatesWithAparan = $derived(aparanData?.totalCandidatesWithAparan || 0);
  let totalAparanCandidates = $derived(aparanData?.totalAparanCandidates || 0);

  function handleConstituencyClick(number) {
    if (number) {
      setConstituencyHash(number);
      setSelectedConstituencyById(String(number));
    }
  }
</script>

<div class="dummy-dist">
  <div class="intro">
      {$_('charts.aparanDefinition')}
  </div>

  <div class="stats-summary">
    <div class="stat-box">
      <div class="stat-count">{totalCandidatesWithAparan}</div>
      <div class="stat-label">{$_('charts.candidatesWithAparan')}</div>
    </div>
    <div class="stat-box">
      <div class="stat-count">{totalAparanCandidates}</div>
      <div class="stat-label">{$_('charts.totalAparans')}</div>
    </div>
  </div>

  <div class="mobile-tabs">
    {#each ALLIANCES as alliance (alliance)}
      <button 
        class="tab-btn" 
        class:active={activeAlliance === alliance}
        onclick={() => activeAlliance = alliance}
      >
        {alliance} ({aparanData?.allianceStats[alliance] || 0})
      </button>
    {/each}
  </div>

  <div class="alliance-grid">
    {#each ALLIANCES as alliance (alliance)}
      <div class="alliance-column" class:inactive={activeAlliance !== alliance}>
        <div class="column-header">{alliance} ({aparanData?.allianceStats[alliance] || 0})</div>
        <div class="column-list">
          {#each aparanData?.byAlliance[alliance] || [] as item (item.candidate.reference)}
            <button 
              class="list-item alliance-card"
              onclick={() => handleConstituencyClick(item.constituency.number)}
            >
              <div class="constituency-info">
                <span class="const-name">{getConstituencyName(item.constituency, lang)}</span>
                <span class="const-district">({getDistrictName(item.constituency, lang)})</span>
                <span class="aparan-count"> - {item.aparans.length}</span>
              </div>
              <div class="main-candidate">
                <span class="cand-name">{getCandidateName(item.candidate, lang)}</span>
                <span class="cand-party">({item.candidate.party})</span>
              </div>
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .dummy-dist {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .intro {
    padding: 16px;
    background: var(--card2);
    border-radius: 8px;
    border: 1px solid var(--border);
    font-family: 'Manjari', sans-serif;
    font-size: var(--fs-sm);
    color: var(--text);
    margin: 0 0 8px 0;
    line-height: 1.5;
  }

  .stats-summary {
    display: flex;
    gap: 12px;
  }

  .stat-box {
    flex: 1;
    padding: 20px;
    background: #FEF3C7;
    border: 1px solid #FCD34D;
    border-radius: 12px;
    text-align: center;
  }

  .stat-count {
    font-family: 'Manjari', sans-serif;
    font-size: 32px;
    font-weight: 700;
    color: #B45309;
  }

  .stat-label {
    font-family: 'Manjari', monospace;
    font-size: 10px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #92400E;
    margin-top: 4px;
  }

  .mobile-tabs {
    display: none;
    gap: 8px;
    margin-top: 8px;
  }

  .tab-btn {
    flex: 1;
    padding: 8px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-family: 'Manjari', monospace;
    font-size: 11px;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tab-btn.active {
    background: var(--gold-light);
    border-color: var(--gold-mid);
    color: #B45309;
    font-weight: 700;
  }

  .alliance-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 8px;
  }

  .alliance-column {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg-card);
    overflow: hidden;
  }

  .column-header {
    padding: 10px 16px;
    background: var(--card2);
    border-bottom: 1px solid var(--border);
    font-family: 'Manjari', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    text-align: center;
  }

  .column-list {
    max-height: 500px;
    overflow-y: auto;
  }

  .list-item {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 14px 16px;
    border: none;
    border-bottom: 1px solid var(--border);
    background: transparent;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s ease;
    gap: 4px;
  }

  .list-item:last-child {
    border-bottom: none;
  }

  .list-item:hover {
    background: var(--card2);
  }

  .constituency-info {
    font-size: 11px;
    color: var(--muted);
    font-family: 'Manjari', sans-serif;
  }

  .const-name {
    font-weight: 500;
  }

  .aparan-count {
    color: #B45309;
    font-weight: 700;
  }

  .main-candidate {
    font-family: 'Manjari', sans-serif;
    font-size: var(--fs-sm);
    color: var(--text);
    margin-top: 2px;
  }

  .cand-name {
    font-weight: 700;
  }

  .cand-party {
    font-size: 11px;
    color: var(--muted);
    margin-left: 4px;
  }

  .aparan-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 6px;
  }

  .aparan-tag {
    font-size: 10px;
    padding: 2px 6px;
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text-soft);
  }

  @media (max-width: 1024px) {
    .mobile-tabs {
      display: flex;
    }

    .alliance-column.inactive {
      display: none;
    }

    .alliance-grid {
      grid-template-columns: 1fr;
    }
    
    .column-list {
      max-height: none;
    }
  }
</style>
