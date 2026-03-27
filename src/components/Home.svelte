<script>
  import { onMount } from 'svelte';
  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  import Disclaimer from './Disclaimer.svelte';
  import StatsSection from './StatsSection.svelte';
  import DataExplorer from './DataExplorer.svelte';
  import Modal from './Modal.svelte';
  import { initLanguage } from '../lib/i18n.js';

  onMount(() => {
    initLanguage();
  });
</script>

<Header />

<div class="container">
  <StatsSection />
  <DataExplorer />
</div>

<Footer />
<Disclaimer />
<Modal />

<style>
  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
  }
</style>