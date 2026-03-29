<script>
  import { _ } from '../lib/i18n.js';
  import { openDisclaimer } from '../stores/uiStore.js';

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
    <div class="footer-version">
      <span class="version-item">
        <span class="version-label">App version:</span><span class="version-value">&nbsp;{appVersion}</span>
      </span>
      <span class="version-divider">|</span>
      <span class="version-item">
        <span class="version-label">Data version:</span><span class="version-value">&nbsp;{dataVersion}</span>
      </span>
    </div>
  </div>
  <div class="footer-right">
    <a class="footer-disc-link" href="/KLA2026/about">About</a>
    <button class="footer-disc-link" id="footer-disc-link" onclick={openDisclaimer}>{$_('footer.viewDisclaimer')}</button>
    <a class="footer-disc-link" href="/KLA2026/about">{$_('footer.reportIssues')}</a>
  </div>
</footer>

<style>
  footer {
    border-top: 1px solid var(--border);
    padding: 18px 32px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
    background: #fff;
  }
  .footer-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 200px;
  }
  .footer-text {
    font-family: 'DM Mono', monospace;
    font-size: var(--fs-sm);
    color: var(--text-soft);
    letter-spacing: 0.07em;
  }
  .footer-version {
    font-family: 'DM Mono', monospace;
    font-size: var(--fs-xs);
    color: var(--text-soft);
    letter-spacing: 0.05em;
    opacity: 0.8;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .version-item {
    display: inline-flex;
    flex-wrap: wrap;
  }
  .version-label {
    color: var(--gold);
  }
  .version-divider {
    color: var(--border);
  }
  .footer-right {
    display: flex;
    gap: 16px;
  }
  .footer-disc-link {
    font-family: 'DM Mono', monospace;
    font-size: var(--fs-sm);
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

  .disc-content {
    margin-top: 12px;
    font-size: var(--fs-xs);
    color: var(--text-soft);
    line-height: 1.6;
    max-width: 600px;
  }

  .disc-content strong {
    display: block;
    font-family: 'DM Mono', monospace;
    font-size: var(--fs-sm);
    color: var(--text);
    margin-bottom: 4px;
    letter-spacing: 0.05em;
  }

  .disc-content p {
    margin: 0;
    margin-bottom: 4px;
  }

  .disc-content p:last-child {
    margin-bottom: 0;
  }

  .disc-content a {
    color: var(--udf);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  @media (max-width: 640px) {
    footer { padding: 12px 16px; flex-direction: column; gap: 12px; }
    .footer-text { font-size: var(--fs-xs); }
    .footer-version { font-size: var(--fs-xs); }
  }
</style>
