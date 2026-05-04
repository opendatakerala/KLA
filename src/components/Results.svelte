<script>
  import { _ } from '../lib/i18n.js';
  import { resultStore } from '../stores/resultStore.js';

  let results = $derived($resultStore);
  let loading = $derived(results?.loading || false);
  let error = $derived(results?.error ? true : false);
  let data = $derived(results?.data || null);
</script>

<div class="results-section" id="results-section">
  <h2 class="results-title">{$_('results.title')}</h2>

  {#if loading}
    <div class="component-loading">
      <div class="shimmer"></div>
      <span>{$_('charts.loading')}</span>
    </div>
  {:else if error}
    <div class="results-error">
      <span>{$_('charts.failedToLoad')}</span>
    </div>
  {:else if data}
    <div class="results-content">
    </div>
  {:else}
    <div class="results-empty">
    </div>
  {/if}
</div>

<style>
  .results-section {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    margin-bottom: 24px;
    padding: 20px;
  }

  .results-title {
    font-size: var(--fs-xl);
    font-weight: 600;
    color: var(--text);
    margin-bottom: 16px;
  }

  .component-loading {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--muted);
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
  }

  .shimmer {
    width: 60px;
    height: 60px;
    background: var(--card2);
    border-radius: 50%;
    position: relative;
    animation: pulse 1.5s infinite ease-in-out;
  }

  @keyframes pulse {
    0% { transform: scale(0.95); opacity: 0.5; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(0.95); opacity: 0.5; }
  }

  .results-error {
    text-align: center;
    padding: 20px;
    color: var(--muted);
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
  }

  .results-content {
  }

  .results-empty {
    text-align: center;
    padding: 20px;
    color: var(--muted);
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
  }
</style>
