<script>
  import { onMount } from 'svelte';
  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  import Disclaimer from './Disclaimer.svelte';
  import MapView from './MapView.svelte';
  import StatsSection from './StatsSection.svelte';
  import TableView from './TableView.svelte';
  import { initLanguage } from '../lib/i18n.js';

  import constituencies from '../data/constituencies.json';
  import historicalComparison from '../data/historical-comparison.json';
  const historicalData = historicalComparison;

  const stats = {
    ldf: constituencies.filter(c => c.candidates.some(x => x.alliance === 'LDF' && x.name)).length,
    udf: constituencies.filter(c => c.candidates.some(x => x.alliance === 'UDF' && x.name)).length,
    nda: constituencies.filter(c => c.candidates.some(x => x.alliance === 'NDA' && x.name)).length,
    sc: constituencies.filter(c => c.reservation === 'SC').length,
    st: constituencies.filter(c => c.reservation === 'ST').length,
  };

  const districts = [...new Set(constituencies.map(c => c.District))].sort();
  const total = constituencies.length;

  onMount(() => {
    initLanguage();
    
    document.getElementById('map-view').style.display = 'none';
    
    document.querySelector('.view-tabs')?.addEventListener('click', (e) => {
      const tab = e.target.closest('.view-tab');
      if (!tab) return;
      
      const view = tab.dataset.view;
      const mapView = document.getElementById('map-view');
      const tableView = document.getElementById('table-view');
      
      document.querySelectorAll('.view-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.view === view);
      });
      
      if (view === 'map') {
        mapView.style.display = 'block';
        tableView.style.display = 'none';
      } else {
        mapView.style.display = 'none';
        tableView.style.display = 'block';
      }
    });
    
    const discOverlay = document.getElementById('disc-overlay');
    
    document.getElementById('disclaimer-btn')?.addEventListener('click', () => {
      discOverlay?.classList.add('open');
    });

    document.getElementById('footer-disc-link')?.addEventListener('click', () => {
      discOverlay?.classList.add('open');
    });

    discOverlay?.addEventListener('click', (e) => {
      const ok = e.target.id === 'disc-ok' || e.target.id === 'disc-dismiss';
      if (ok || e.target === discOverlay) discOverlay.classList.remove('open');
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        discOverlay?.classList.remove('open');
      }
    });
  });
</script>

<Header totalCandidates="—" />

<div class="container">
  <StatsSection {stats} />
  <MapView />
  <TableView 
    {stats}
    {districts}
    data={constituencies}
    {total}
    {historicalData}
  />
</div>

<Footer />
<Disclaimer />
