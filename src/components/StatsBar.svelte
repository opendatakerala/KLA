<script>
  import { onMount } from 'svelte';
  import { _ } from '../lib/i18n.js';
  import { disclaimerDismissed } from '../stores/uiStore.js';

  const statsData = [
    { key: 'constituencies', value: 140 },
    { key: 'alliances', value: 3 },
    { key: 'parties', value: 25 },
    { key: 'nominations', value: 2125 },
    { key: 'applications', value: 1254 },
    { key: 'afterScrutiny', value: 985 },
    { key: 'contesting', value: 883 },
    { key: 'booths', value: 30471 },
    { key: 'voters', value: 27142952 },
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
      <div class="stat-label">{$_(`statsBar.${stat.key}`)}</div>
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
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1 1 auto;
      min-width: 120px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px 16px 12px;
      text-align: center;
    }
    
    .stat-value {
      font-family: 'Inter', sans-serif;
      font-size: var(--fs-2xl);
      font-weight: 700;
      line-height: 1.1;
      color: var(--text);
      margin-bottom: 4px;
      white-space: nowrap;
    }
    
    .stat-label {
      font-family: 'DM Mono', monospace;
      font-size: var(--fs-xs);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
      line-height: 1.4;
      text-wrap: balance;
    }
    
    @media (max-width: 640px) {
      .stats-bar { 
        gap: 6px; 
        justify-content: center; 
      }
      .stat-cell {
        flex: 1 1 calc(50% - 6px); 
        min-width: 0;
        padding: 12px 8px 10px;
      }
      .stat-value { font-size: var(--fs-base); }
      .stat-label { font-size: var(--fs-xs); }
    }
</style>
