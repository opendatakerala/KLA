<script>
  import PartyDistributionBar from './PartyDistributionBar.svelte';
  import PartyDistributionBubble from './PartyDistributionBubble.svelte';

  const { isActive = false } = $props();

  let vizType = $state('bubble');
</script>

<div class="party-dist-wrapper">
  <div class="viz-switcher">
    <button 
      class="switch-btn" 
      class:active={vizType === 'bubble'}
      onclick={() => vizType = 'bubble'}
    >
      Bubble
    </button>
    <button 
      class="switch-btn" 
      class:active={vizType === 'bar'}
      onclick={() => vizType = 'bar'}
    >
      Bar
    </button>
  </div>

  {#if vizType === 'bubble'}
    <PartyDistributionBubble {isActive} />
  {:else}
    <PartyDistributionBar {isActive} />
  {/if}
</div>

<style>
  .party-dist-wrapper {
    position: relative;
  }

  .viz-switcher {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    gap: 4px;
    z-index: 10;
  }

  .switch-btn {
    padding: 4px 8px;
    border: 1px solid var(--border);
    background: var(--card2);
    color: var(--text-muted);
    font-family: 'Manjari', sans-serif;
    font-size: 11px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .switch-btn:hover {
    background: var(--hover);
  }

  .switch-btn.active {
    background: var(--gold);
    color: #111827;
    border-color: var(--gold);
  }
</style>