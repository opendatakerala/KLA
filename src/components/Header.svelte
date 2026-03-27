<script>
  import { onMount } from 'svelte';
  import SearchBar from './SearchBar.svelte';

  let days = $state(0);
  let hours = $state(0);
  let minutes = $state(0);
  let seconds = $state(0);
  let pollingStarted = $state(false);

  const POLLING_DAY = new Date('2026-04-09T06:00:00+05:30');

  function updateCountdown() {
    const now = new Date();
    const diff = POLLING_DAY - now;
    if (diff <= 0) {
      pollingStarted = true;
      return;
    }
    days = Math.floor(diff / (1000 * 60 * 60 * 24));
    hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((diff % (1000 * 60)) / 1000);
  }

  onMount(() => {
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  });

  function pad(n) {
    return String(n).padStart(2, '0');
  }
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
      {#if pollingStarted}
        <div class="countdown-box polling-live">
          <div class="countdown-label">🗳️ Polling Day</div>
          <div class="countdown-live-text">Polling Underway</div>
        </div>
      {:else}
        <div class="countdown-box">
          <div class="countdown-label">⏳ Polling Day · 9 Apr 2026, 6 AM</div>
          <div class="countdown-units">
            <div class="cunit">
              <span class="cnum">{days}</span>
              <span class="clabel">Days</span>
            </div>
            <span class="csep">:</span>
            <div class="cunit">
              <span class="cnum">{pad(hours)}</span>
              <span class="clabel">Hrs</span>
            </div>
            <span class="csep">:</span>
            <div class="cunit">
              <span class="cnum">{pad(minutes)}</span>
              <span class="clabel">Min</span>
            </div>
            <span class="csep">:</span>
            <div class="cunit">
              <span class="cnum">{pad(seconds)}</span>
              <span class="clabel">Sec</span>
            </div>
          </div>
        </div>
      {/if}
      <div class="lang-switcher" id="lang-switcher">
        <button class="lang-btn active" data-lang="en">EN</button>
        <button class="lang-btn" data-lang="ml">മല</button>
      </div>
    </div>
  </div>
  <div class="header-search">
    <SearchBar />
  </div>
</header>

<style>
  header {
    background: #fff;
    border-bottom: 1px solid var(--border);
    box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  }

  .header-stripe {
    height: 4px;
    background: linear-gradient(90deg, var(--ldf) 25%, var(--udf) 25% 50%, var(--nda) 50% 75%, var(--others) 75%);
  }

  .header-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px 32px 14px;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 20px;
  }

  .header-search {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 32px 16px;
  }

  .header-logo-wrap { display: flex; align-items: center; flex-shrink: 0; }
  .header-logo { width: 60px; height: 60px; object-fit: contain; border-radius: 10px; }

  .header-title { flex: 1; }

  .header-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: #000;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 4px;
    display: flex; align-items: center; gap: 10px;
  }

  .header-eyebrow::before {
    content: '';
    display: inline-block;
    width: 16px; height: 2px;
    background: #000;
    border-radius: 1px;
  }

  h1 {
    font-family: 'Inter', sans-serif;
    font-size: clamp(20px, 3vw, 44px);
    font-weight: 900;
    line-height: 1.05;
    color: #000;
    letter-spacing: -0.02em;
  }

  h1 em { font-style: italic; color: #000; }

  .header-tagline {
    font-size: 12px;
    color: #000;
    font-weight: 700;
    margin-top: 3px;
  }

  .header-tagline span {
    font-size: 11px;
    color: var(--gold);
    font-weight: 600;
    font-style: italic;
  }

  .header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    flex-shrink: 0;
  }

  .countdown-box {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 14px;
    text-align: center;
  }

  .countdown-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6px;
  }

  .countdown-units {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .cunit {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 32px;
  }

  .cnum {
    font-family: 'Inter', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: var(--text);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .clabel {
    font-family: 'DM Mono', monospace;
    font-size: 7px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    margin-top: 2px;
  }

  .csep {
    font-size: 18px;
    font-weight: 700;
    color: var(--muted);
    margin-bottom: 12px;
  }

  .polling-live {
    border-color: #16a34a;
    background: #f0fdf4;
  }

  .countdown-live-text {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #16a34a;
  }

  .lang-switcher {
    display: flex;
    gap: 2px;
    background: var(--bg2);
    border-radius: 6px;
    padding: 2px;
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

  @media (max-width: 640px) {
    .header-stripe { height: 3px; }
    .header-inner {
      grid-template-columns: auto 1fr;
      padding: 12px 16px 10px;
      gap: 12px;
    }
    .header-search {
      padding: 0 16px 12px;
    }
    .header-logo { width: 44px; height: 44px; }
    .header-right { display: none; }
    h1 { font-size: 22px; }
    .header-eyebrow { font-size: 9px; }
    .header-tagline { font-size: 11px; }
  }
</style>