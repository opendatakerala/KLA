<script>
  import { _ } from '../lib/i18n.js';
</script>

<footer>
  <span class="footer-text">{$_('footer.credits')}</span>
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
  .footer-text {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--faint);
    letter-spacing: 0.07em;
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
  }
</style>
