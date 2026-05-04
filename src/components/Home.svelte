<script>
  import { isLoading, _ } from '../lib/i18n.js';
  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  import Disclaimer from './Disclaimer.svelte';
  // import TurnoutLineChart from './charts/TurnoutLineChart.svelte';
  // import { overallTurnoutStore } from '../stores/turnoutStore.js';
  import "@fontsource/manjari";

  let StatsSection = $state(null);
  let DataExplorer = $state(null);
  let Modal = $state(null);

  function loadComponents() {
    StatsSection = import('./StatsSection.svelte').then(m => m.default);
    DataExplorer = import('./DataExplorer.svelte').then(m => m.default);
    Modal = import('./Modal.svelte').then(m => m.default);
  }

  // let overallTurnoutData = $derived($overallTurnoutStore);
  // let overallTurnoutLoading = $derived(overallTurnoutData?.loading || false);
  // let overallTurnoutError = $derived(overallTurnoutData?.error ? true : false);
  // let overallTurnoutValues = $derived(overallTurnoutData?.data?.data?.['voter-turnout'] || null);
</script>

{#if $isLoading}
  <div class="loading">{$_('charts.loading')}</div>
{:else}
  <Header />

  <div class="container">
    {#if !StatsSection}
      <button class="toggle-btn" onclick={loadComponents}>{$_('home.showVotingDetails')}</button>
    {:else}
      {#await StatsSection}
        <div class="component-loading">
          <div class="shimmer"></div>
          <span>{$_('charts.loading')}</span>
        </div>
      {:then Component}
        <!-- <TurnoutLineChart 
          data={overallTurnoutValues} 
          loading={overallTurnoutLoading} 
          error={overallTurnoutError} 
        /> -->
        <Component />
      {/await}

      {#await DataExplorer}
        <div class="component-loading">
          <div class="shimmer"></div>
          <span>{$_('charts.loading')}</span>
        </div>
      {:then Component}
        <Component />
      {/await}
    {/if}
  </div>

  <Footer />
  <Disclaimer />
  
  {#if StatsSection}
    {#await Modal then Component}
      <Component />
    {/await}
  {/if}
{/if}

<style>
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    font-family: 'Manjari', monospace;
    color: var(--muted);
  }

  .container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .component-loading {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: var(--card);
    border: 1px dashed var(--border);
    border-radius: 12px;
    margin-bottom: 24px;
    color: var(--muted);
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
    position: relative;
    overflow: hidden;
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

  .toggle-btn {
    display: block;
    margin: 32px auto;
    padding: 12px 24px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-family: 'Manjari', monospace;
    font-size: var(--fs-base);
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }

  .toggle-btn:hover {
    background: var(--card2);
    border-color: var(--gold);
  }
</style>
