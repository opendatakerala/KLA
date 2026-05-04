<script>
  import { onMount } from 'svelte';
  // import SearchBar from './SearchBar.svelte';
  import { locale, _, setLanguage } from '../lib/i18n.js';
  
  import logo from "../images/logo-kla2026b.svg"

  let days = $state(0);
  let hours = $state(0);
  let minutes = $state(0);
  let seconds = $state(0);
  let resultsStarted = $state(false);

  const RESULTS_DAY = new Date('2026-05-04T08:00:00+05:30');

  function updateCountdown() {
    const now = new Date();
    const diff = RESULTS_DAY - now;
    if (diff <= 0) {
      resultsStarted = true;
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

  function handleLangSwitch(e) {
    const lang = e.target.dataset.lang;
    if (lang) setLanguage(lang);
  }

  let currentLang = $derived($locale);
</script>

<header>
  <div class="header-stripe"></div>
  <div class="header-inner">
    <div class="header-logo-wrap">
      <img class="header-logo" src={logo.src} alt="KLA Elections 2026 Logo" />
    </div>
    <div class="header-title">
      <div class="header-eyebrow">{$_('site.title')}</div>
      <h1>{$_('site.election')}</h1>
      <div class="header-tagline">
        <span>{$_('site.tagline')}</span>
        <span>&nbsp;&bull; <span>{$_('site.initiative')}</span></span>
      </div>
    </div>
    <div class="header-external-links">
      <span class="external-links-label">{$_('header.alsoFromODK')}</span>
      <a href="https://mlatrack.com/" target="_blank" rel="noopener noreferrer">MLA Track</a>
      <a href="https://opendatakerala.org/LSG2025/" target="_blank" rel="noopener noreferrer">LSG Election Portal</a>
    </div>
    <div class="header-right">
      {#if resultsStarted}
        <div class="countdown-box polling-live">
          <div class="countdown-label">🗳️ Vote Counting Day</div>
          <div class="countdown-live-text">{$_('header.voteCountingUnderway')}</div>
        </div>
      {:else}
        <div class="countdown-box">
          <div class="countdown-label">{$_('header.voteCountingDay')}</div>
          <div class="countdown-units">
            <div class="cunit">
              <span class="cnum">{days}</span>
              <span class="clabel">{$_('header.days')}</span>
            </div>
            <span class="csep">:</span>
            <div class="cunit">
              <span class="cnum">{pad(hours)}</span>
              <span class="clabel">{$_('header.hours')}</span>
            </div>
            <span class="csep">:</span>
            <div class="cunit">
              <span class="cnum">{pad(minutes)}</span>
              <span class="clabel">{$_('header.minutes')}</span>
            </div>
            <span class="csep">:</span>
            <div class="cunit">
              <span class="cnum">{pad(seconds)}</span>
              <span class="clabel">{$_('header.seconds')}</span>
            </div>
          </div>
        </div>
      {/if}
      <div class="lang-switcher" id="lang-switcher" role="group" aria-label="Language">
        <button 
          class="lang-btn" 
          class:active={currentLang === 'en'} 
          data-lang="en"
          onclick={handleLangSwitch}
        >{$_('language.en')}</button>
        <button 
          class="lang-btn" 
          class:active={currentLang === 'ml'} 
          data-lang="ml"
          onclick={handleLangSwitch}
        >{$_('language.ml')}</button>
      </div>
    </div>
  </div>
  <!-- <div class="header-search">
    <SearchBar />
  </div> -->
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
    max-width: 1600px;
    margin: 0 auto;
    padding: 20px 32px 14px;
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 20px;
  }

  .header-search {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 32px 16px;
  }

  .header-logo-wrap { display: flex; align-items: center; flex-shrink: 0; }
  .header-logo { width: 100px; height: 100px; object-fit: contain; border-radius: 10px; }

  .header-title { flex: 1; display: flex; flex-direction: column; }

  .header-external-links {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .external-links-label {
    font-size: var(--fs-xs);
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0 4px;
  }

  .header-eyebrow {
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
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
    font-family: 'Manjari', sans-serif;
    font-size: clamp(20px, 3vw, 44px);
    font-weight: 900;
    line-height: 1.05;
    color: #000;
    letter-spacing: -0.02em;
  }

  .header-tagline {
    font-size: var(--fs-base);
    color: #000;
    font-weight: 700;
    margin-top: 3px;
  }

  .header-tagline span {
    font-size: var(--fs-sm);
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
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
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
    flex-grow: 1;
    align-items: center;
    min-width: 32px;
  }

  .cnum {
    font-family: 'Manjari', sans-serif;
    font-size: var(--fs-2xl);
    font-weight: 800;
    color: var(--text);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .clabel {
    font-family: 'Manjari', monospace;
    font-size: var(--fs-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    margin-top: 2px;
  }

  .csep {
    font-size: var(--fs-lg);
    font-weight: 700;
    color: var(--muted);
    margin-bottom: 12px;
  }

  .polling-live {
    border-color: #16a34a;
    background: #f0fdf4;
  }

  .countdown-live-text {
    font-family: 'Manjari', sans-serif;
    font-size: var(--fs-base);
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
    font-family: 'Manjari', monospace;
    font-size: var(--fs-sm);
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

  .header-external-links {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .header-external-links a {
    font-size: var(--fs-sm);
    color: var(--text);
    text-decoration: none;
    padding: 4px 12px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--card);
    transition: all 0.15s;
  }

  .header-external-links a:hover {
    color: var(--gold);
    border-color: var(--gold);
  }

  @media (max-width: 640px) {
    .header-stripe { height: 3px; }
    .header-inner {
      grid-template-columns: auto 1fr;
      padding: 12px 16px 10px;
      gap: 12px;
    }
    .header-search {
      display: none;
    }
    .header-external-links {
      display: none;
    }
    .header-logo { width: 60px; height: 60px; }
    .header-right {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 12px;
      grid-column: 1 / -1;
      padding-top: 8px;
      border-top: 1px solid var(--border);
      margin-top: 4px;
    }
    .countdown-box {
      padding: 6px 10px;
    }
    .countdown-label { font-size: 9px; margin-bottom: 2px; }
    .countdown-units { gap: 2px; }
    .cunit { min-width: 24px; }
    .cnum { font-size: var(--fs-lg); }
    .clabel { font-size: 8px; }
    .csep { font-size: var(--fs-sm); margin-bottom: 8px; }
    .lang-switcher { 
      flex-direction: column; 
      gap: 4px; 
      height: 100%;
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 4px;
      position: relative;
    }
    .lang-btn { 
      flex: 1;
      padding: 4px 12px; 
      font-size: 11px; 
      background: transparent;
      border: none;
      color: var(--muted);
      position: relative;
      z-index: 1;
      transition: color 0.4s ease;
    }
    .lang-btn.active {
      color: var(--gold);
    }
    h1 { font-size: var(--fs-xl); }
    .header-eyebrow { font-size: var(--fs-xs); }
    .header-tagline { font-size: var(--fs-sm); }
  }
</style>