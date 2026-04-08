<script>
  import { onMount } from 'svelte';
  import { _ } from '../lib/i18n.js';
  import StatsBar from './StatsBar.svelte';
  import PartyDistribution from './charts/PartyDistribution.svelte';
  import GenderDistribution from './charts/GenderDistribution.svelte';
  import AgeDistribution from './charts/AgeDistribution.svelte';
  import DummyDistribution from './charts/DummyDistribution.svelte';
  import EducationDistribution from './charts/EducationDistribution.svelte';

  let collapsed = true;
  let activeTab = '';

  function handleTabClick(stat) {
    if (activeTab === stat && !collapsed) {
      collapsed = true;
      activeTab = '';
    } else {
      activeTab = stat;
      collapsed = false;
    }

    setTimeout(() => {
      window.dispatchEvent(new Event('stats-tab-shown'));
    }, 10);
  }
</script>

<div class="stats-section" class:collapsed id="stats-section">
  <StatsBar />
  <div class="stats-tabs">
    <button 
      class="stats-tab" 
      class:active={activeTab === 'candidates-by-party'}
      data-stat="candidates-by-party"
      onclick={() => handleTabClick('candidates-by-party')}
    >
      <span>{$_('stats.partyDistribution')}</span>
    </button>
    <button 
      class="stats-tab"
      class:active={activeTab === 'gender-distribution'}
      data-stat="gender-distribution"
      onclick={() => handleTabClick('gender-distribution')}
    >
      <span>{$_('stats.genderDistribution')}</span>
    </button>
    <button 
      class="stats-tab"
      class:active={activeTab === 'age-distribution'}
      data-stat="age-distribution"
      onclick={() => handleTabClick('age-distribution')}
    >
      <span>{$_('stats.ageDistribution')}</span>
    </button>
    <button 
      class="stats-tab"
      class:active={activeTab === 'dummy-distribution'}
      data-stat="dummy-distribution"
      onclick={() => handleTabClick('dummy-distribution')}
    >
      <span>{$_('stats.dummyDistribution')}</span>
    </button>
    <button 
      class="stats-tab"
      class:active={activeTab === 'education-distribution'}
      data-stat="education-distribution"
      onclick={() => handleTabClick('education-distribution')}
    >
      <span>{$_('stats.educationDistribution')}</span>
      <span class="experimental-badge">{$_('stats.experimental')}</span>
    </button>
  </div>

  <div class="stats-content">
    <div class="stats-panel" class:active={activeTab === 'candidates-by-party'}>
      <PartyDistribution isActive={activeTab === 'candidates-by-party'} />
    </div>

    <div class="stats-panel" class:active={activeTab === 'gender-distribution'}>
      <GenderDistribution isActive={activeTab === 'gender-distribution'} />
    </div>

    <div class="stats-panel" class:active={activeTab === 'age-distribution'}>
      <AgeDistribution isActive={activeTab === 'age-distribution'} />
    </div>

    <div class="stats-panel" class:active={activeTab === 'dummy-distribution'}>
      <DummyDistribution isActive={activeTab === 'dummy-distribution'} />
    </div>

    <div class="stats-panel" class:active={activeTab === 'education-distribution'}>
      <EducationDistribution isActive={activeTab === 'education-distribution'} />
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
    flex-wrap: wrap;
    gap: 4px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    background: var(--card2);
  }

  .stats-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
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

  .experimental-badge {
    font-size: 9px;
    padding: 2px 6px;
    background: #FEF3C7;
    color: #B45309;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
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
</style>
