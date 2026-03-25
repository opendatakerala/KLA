<script>
  export let totalCandidates = '—';
</script>

<header>
  <div class="header-stripe"></div>
  <div class="header-inner">
    <div class="header-logo-wrap">
      <img class="header-logo" src="https://opendatakerala.org/LSG2025/assets/logo-DnFodOdy.png" alt="OpenDataKerala Logo" />
    </div>
    <div class="header-title">
      <div class="header-eyebrow" data-i18n="site.title">Kerala Legislative Assembly</div>
      <h1>Election <em>2026</em></h1>
      <div class="header-tagline">
        <span data-i18n="site.tagline">Candidate list across all 140 constituencies · 14 districts</span>
        <span>&nbsp;&bull; <span data-i18n="site.initiative">an OpenDataKerala Community Initiative</span></span>
      </div>
    </div>
    <div class="header-right">
      <div class="header-stats">
        <div class="hstat">
          <div class="hstat-num">140</div>
          <div class="hstat-label" data-i18n="header.seats">Seats</div>
        </div>
        <div class="hstat">
          <div class="hstat-num" id="total-candidates">{totalCandidates}</div>
          <div class="hstat-label" data-i18n="header.announcedCandidates">Announced Candidates *</div>
        </div>
      </div>
      <div class="lang-switcher" id="lang-switcher">
        <button class="lang-btn active" data-lang="en">EN</button>
        <button class="lang-btn" data-lang="ml">മല</button>
      </div>
    </div>
  </div>
</header>

<style>
  .lang-switcher {
    display: flex;
    gap: 2px;
    background: var(--bg2);
    border-radius: 6px;
    padding: 2px;
    margin-left: 12px;
  }
  
  .lang-btn {
    padding: 4px 8px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.05em;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s;
  }
  
  .lang-btn:hover {
    color: var(--text);
    background: var(--card);
  }
  
  .lang-btn.active {
    background: var(--card);
    color: var(--gold);
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
</style>
