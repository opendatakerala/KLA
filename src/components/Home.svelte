<script>
  import { isLoading, _ } from '../lib/i18n.js';
  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  import Disclaimer from './Disclaimer.svelte';
  import StatsSection from './StatsSection.svelte';
  import DataExplorer from './DataExplorer.svelte';
  import Modal from './Modal.svelte';
</script>

{#if $isLoading}
  <div class="loading">{$_('charts.loading')}</div>
{:else}
  <Header />

  <div class="container">
    <StatsSection />
    <DataExplorer />
  </div>

  <Footer />
  <Disclaimer />
  <Modal />
{/if}

<style>
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    font-family: 'DM Mono', monospace;
    color: var(--muted);
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
  }
</style>
