<script>
    import { disclaimerDismissed } from '../stores/uiStore.js';

    const hideOverlay = () => {
        document.getElementById("disc-overlay")?.classList.remove("open");
        disclaimerDismissed.set(true);
    };
    const PROD_HOSTNAME = "opendatakerala.org";
    if (typeof window !== "undefined" && location.hostname !== PROD_HOSTNAME) {
        hideOverlay();
    }
</script>

<div class="disc-overlay open" id="disc-overlay">
    <div class="disc-modal">
        <div class="disc-top"></div>
        <div class="disc-header">
            <div class="disc-icon">⚠️</div>
            <div>
                <div class="disc-title" data-i18n="disclaimer.title">
                    Data Disclaimer
                </div>
                <div class="disc-subtitle" data-i18n="disclaimer.subtitle">
                    Please read before proceeding
                </div>
            </div>
        </div>
        <div class="disc-body">
            <p data-i18n="disclaimer.body1">
                The accuracy or completeness of the data presented on this page
                cannot be guaranteed. The information has been sourced from
                Various Medias, party social media handles and CEC Kerala
                website.
            </p>
            <p data-i18n="disclaimer.body2">
                There is a chance for change according to time. Candidate
                announcements may be updated or revised by parties at any point.
            </p>
        </div>
        <div class="disc-footer">
            <button
                class="disc-remind"
                id="disc-dismiss"
                data-i18n="disclaimer.dismiss"
                on:click={hideOverlay}>Dismiss</button
            >
            <button
                class="disc-ok-btn"
                id="disc-ok"
                data-i18n="disclaimer.ok"
                on:click={hideOverlay}>I Understand</button
            >
        </div>
    </div>
</div>

<style>
    .disc-overlay {
        position: fixed;
        inset: 0;
        background: rgba(17,24,39,0.5);
        backdrop-filter: blur(5px);
        display: flex;
        z-index: 200;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
    }
    .disc-overlay.open { opacity: 1; pointer-events: all; }

    .disc-modal {
        background: var(--card);
        border: 1px solid var(--border);
        width: 100%;
        overflow: hidden;
        transform: translateY(30px);
        transition: transform 0.3s;
        box-shadow: 0 -4px 40px rgba(0,0,0,0.18);
        margin-top: auto;
    }
    .disc-overlay.open .disc-modal { transform: translateY(0); }

    .disc-top { height: 5px; background: linear-gradient(90deg, #F5C842, #D4960E, #A07010); }

    .disc-header { padding: 24px 28px 12px; display: flex; align-items: flex-start; gap: 14px; }

    .disc-icon {
        width: 40px;
        height: 40px;
        background: #FEF9EC;
        border: 1.5px solid #F5D76E;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
        margin-top: 2px;
    }

    .disc-title {
        font-family: 'Inter', sans-serif;
        font-weight: 700;
        font-size: 22px;
        color: var(--text);
        margin-bottom: 3px;
    }

    .disc-subtitle {
        font-family: 'DM Mono', monospace;
        font-size: 10px;
        color: var(--muted);
        letter-spacing: 0.1em;
        text-transform: uppercase;
    }

    .disc-body {
        padding: 0 28px 20px;
        font-size: 14px;
        color: var(--text-soft);
        line-height: 1.75;
        font-weight: 300;
        max-height: 40vh;
        overflow-y: auto;
    }
    .disc-body p + p { margin-top: 10px; }
    .disc-body a { color: var(--udf); text-decoration: underline; text-underline-offset: 2px; word-break: break-all; }

    .disc-footer {
        padding: 12px 28px 22px;
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: flex-end;
        border-top: 1px solid var(--border);
        background: var(--bg2);
    }

    .disc-ok-btn {
        padding: 10px 26px;
        background: var(--gold-mid);
        color: #fff;
        border: none;
        border-radius: 7px;
        font-family: 'DM Mono', monospace;
        font-size: 11px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        cursor: pointer;
        transition: background 0.2s;
        font-weight: 500;
    }
    .disc-ok-btn:hover { background: var(--gold); }

    .disc-remind {
        font-family: 'DM Mono', monospace;
        font-size: 10px;
        color: var(--faint);
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
        background: none;
        border: none;
        transition: color 0.2s;
        letter-spacing: 0.04em;
    }
    .disc-remind:hover { color: var(--muted); }

    @media (max-width: 640px) {
        .disc-overlay { align-items: flex-end; padding: 0; }
        .disc-modal { border-radius: 16px 16px 0 0; max-width: 100%; max-height: 90vh; overflow-y: auto; }
    }
    @media (min-width: 641px) {
        .disc-overlay { align-items: center; padding: 24px; }
        .disc-modal { border-radius: 14px; max-width: 560px; }
    }
</style>
