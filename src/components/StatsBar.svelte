<script>
  import { onMount } from 'svelte';
  import { t } from '../lib/i18n.js';
  import { disclaimerDismissed } from '../stores/uiStore.js';

  const statsData = [
    { key: 'constituencies', value: 140 },
    { key: 'alliances', value: 3 },
    { key: 'parties', value: 25 },
    { key: 'nominations', value: 2117 },
    { key: 'applications', value: 1252 },
    { key: 'afterScrutiny', value: '????' },
    { key: 'contesting', value: '???' },
    { key: 'booths', value: 30471 },
    { key: 'voters', value: '???????' },
  ];

  let displayedValues = $state(statsData.map(() => 0));
  let animationStarted = $state(false);

  function startAnimation() {
    if (animationStarted) return;
    animationStarted = true;

    const duration = 1500;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      statsData.forEach((stat, index) => {
        if (typeof stat.value === 'number') {
          displayedValues[index] = Math.floor(stat.value * eased);
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        statsData.forEach((stat, index) => {
          if (typeof stat.value === 'number') {
            displayedValues[index] = stat.value;
          }
        });
      }
    }

    requestAnimationFrame(animate);
  }

  $effect(() => {
    if ($disclaimerDismissed) {
      setTimeout(() => startAnimation(), 300);
    }
  });
</script>

<div class="stats-bar">
  {#each statsData as stat, index}
    <div class="stat-cell">
      <div class="stat-value">
        {typeof stat.value === 'number' ? displayedValues[index].toLocaleString() : stat.value}
      </div>
      <div class="stat-label" data-i18n="statsBar.{stat.key}">{t('statsBar.' + stat.key)}</div>
    </div>
  {/each}
</div>

<style>
  .stats-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 28px;
  }

  .stat-cell {
    flex: 1 1 calc(11.11% - 8px);
    min-width: 90px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 14px 10px 12px;
    text-align: center;
  }

  .stat-value {
    font-family: 'Inter', sans-serif;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.1;
    color: var(--text);
    margin-bottom: 4px;
  }

  .stat-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    .stats-bar { gap: 6px; }
    .stat-cell {
      flex: 1 1 calc(25% - 6px);
      min-width: 60px;
      padding: 8px 4px 6px;
    }
    .stat-value { font-size: 16px; }
    .stat-label { font-size: 6px; }
  }
</style>