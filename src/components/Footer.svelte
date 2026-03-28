<script>
  import { _ } from '../lib/i18n.js';

  const formatVersion = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

  let appVersion = $derived(formatVersion(import.meta.env.APP_VERSION || ''));
  let dataVersion = $derived(formatVersion(import.meta.env.DATA_VERSION || ''));
</script>

<footer>
  <div class="footer-left">
    <span class="footer-text">{$_('footer.credits')}</span>
    <span class="footer-version">
      <span class="version-label">App version:</span> {appVersion}
      <span class="version-divider">|</span>
      <span class="version-label">Data version:</span> {dataVersion}
    </span>
  </div>
  <button class="footer-disc-link" id="footer-disc-link">{$_('footer.viewDisclaimer')}</button>
</footer>

<style>
  footer {
    border-top: 1px solid var(--border);
    padding: 18px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    background: #fff;
  }
  .footer-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .footer-text {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--faint);
    letter-spacing: 0.07em;
  }
  .footer-version {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    color: var(--faint);
    letter-spacing: 0.05em;
    opacity: 0.8;
  }
  .version-label {
    color: var(--gold);
  }
  .version-divider {
    margin: 0 6px;
    color: var(--border);
  }
  .footer-disc-link {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--gold);
    letter-spacing: 0.07em;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
    background: none;
    border: none;
    transition: color 0.2s;
  }
  .footer-disc-link:hover { color: var(--gold-mid); }

  @media (max-width: 640px) {
    footer { padding: 12px 16px; flex-direction: column; align-items: flex-start; gap: 6px; }
    .footer-text { font-size: 9px; }
    .footer-version { font-size: 8px; }
  }
</style>
