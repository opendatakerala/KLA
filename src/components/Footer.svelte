<script>
  const PROD_HOSTNAME = "opendatakerala.org";
  if (typeof window !== 'undefined' && location.hostname !== PROD_HOSTNAME) {
    const overlay = document.getElementById("disc-overlay");
    if (overlay) overlay.classList.remove("open");
  }
</script>

<footer>
  <span class="footer-text" data-i18n="footer.credits">Kerala Legislative Assembly Election 2026 &middot; Data sourced from Various Media &amp; CEC Kerala &middot; an OpenDataKerala Initiative</span>
  <button class="footer-disc-link" id="footer-disc-link" data-i18n="footer.viewDisclaimer">⚠ View Disclaimer</button>
</footer>
