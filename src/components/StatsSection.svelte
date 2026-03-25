<script>
  import { onMount } from 'svelte';
  import StatsBar from './StatsBar.svelte';
  import PartyDistribution from './charts/PartyDistribution.svelte';
  import GenderDistribution from './charts/GenderDistribution.svelte';

  export let stats = { ldf: 0, udf: 0, nda: 0, sc: 0, st: 0 };

  let collapsed = true;
  let activeTab = '';

  function handleTabClick(tab) {
    if (tab.disabled) return;

    const stat = tab.dataset.stat;
    const isActive = tab.classList.contains('active');

    if (isActive && !collapsed) {
      collapsed = true;
      tab.classList.remove('active');
      return;
    }

    document.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.stats-panel').forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(`${stat}-panel`)?.classList.add('active');
    collapsed = false;

    setTimeout(() => {
      window.dispatchEvent(new Event('stats-tab-shown'));
    }, 10);
  }

  onMount(() => {
    const section = document.getElementById('stats-section');
    const tabs = document.querySelectorAll('.stats-tab');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => handleTabClick(tab));
    });
  });
</script>

<div class="stats-section" class:collapsed id="stats-section">
  <StatsBar {stats} />
  <div class="stats-tabs">
    <button class="stats-tab" data-stat="candidates-by-party">
      <span data-i18n="stats.partyDistribution">Party Distribution</span>
    </button>
    <button class="stats-tab" data-stat="gender-distribution">
      <span data-i18n="stats.genderDistribution">Gender Distribution</span>
    </button>
    <button class="stats-tab" data-stat="criminal-cases" disabled>
      <span data-i18n="stats.criminalCases">Criminal Cases</span>
      <span class="coming-soon">Coming Soon</span>
    </button>
    <button class="stats-tab" data-stat="education-distribution" disabled>
      <span data-i18n="stats.educationDistribution">Education</span>
      <span class="coming-soon">Coming Soon</span>
    </button>
  </div>

  <div class="stats-content">
    <div class="stats-panel" id="candidates-by-party-panel">
      <PartyDistribution />
    </div>

    <div class="stats-panel" id="gender-distribution-panel">
      <GenderDistribution />
    </div>

    <div class="stats-panel" id="criminal-cases-panel">
      <div class="placeholder">
        <div class="placeholder-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div class="placeholder-text" data-i18n="stats.comingSoon">Data coming soon</div>
      </div>
    </div>

    <div class="stats-panel" id="education-distribution-panel">
      <div class="placeholder">
        <div class="placeholder-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div class="placeholder-text" data-i18n="stats.comingSoon">Data coming soon</div>
      </div>
    </div>
  </div>
</div>

<style>
  .stats-section {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    margin-bottom: 24px;
    overflow: hidden;
  }

  .stats-tabs {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    background: var(--card2);
    overflow-x: auto;
  }

  .stats-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.04em;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .stats-tab:hover:not([disabled]) {
    border-color: var(--gold-mid);
    color: var(--text-soft);
  }

  .stats-tab.active {
    background: var(--gold-light);
    border-color: var(--gold-mid);
    color: var(--gold);
  }

  .stats-tab[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .stats-tab .coming-soon {
    font-size: 8px;
    padding: 2px 6px;
    background: var(--bg2);
    border-radius: 10px;
    color: var(--faint);
  }

  .stats-content {
    padding: 20px;
    min-height: 380px;
  }

  .stats-section.collapsed .stats-content {
    display: none;
  }

  .stats-panel {
    display: none;
  }

  .stats-panel.active {
    display: block;
  }

  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 340px;
    color: var(--muted);
  }

  .placeholder-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    color: var(--faint);
  }

  .placeholder-text {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.08em;
  }
</style>
