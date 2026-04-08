<script>
    import { onMount } from 'svelte';
    import { _ } from '../lib/i18n.js';
    import { disclaimerDismissed, disclaimerOpen, closeDisclaimer } from '../stores/uiStore.js';

    let isOpen = $derived($disclaimerOpen);

    const hideOverlay = () => {
        closeDisclaimer();
        disclaimerDismissed.set(true);
    };

    const acceptDisclaimer = () => {
        localStorage.setItem('kla2026disclaimeraccepted', new Date().toISOString());
        hideOverlay();
    };

    onMount(() => {
        const stored = localStorage.getItem('kla2026disclaimeraccepted');
        if (stored) {
            hideOverlay();
            return;
        }
        const PROD_HOSTNAME = "opendatakerala.org";
        if (location.hostname !== PROD_HOSTNAME) {
            hideOverlay();
        }
    });
</script>

<div class="disc-overlay" class:open={isOpen} id="disc-overlay">
    <div class="disc-modal">
        <div class="disc-top"></div>
        <div class="disc-header">
            <div class="disc-icon">⚠️</div>
            <div>
                <div class="disc-title">
                    {$_('disclaimer.title')}
                </div>
                <div class="disc-subtitle">
                    {$_('disclaimer.subtitle')}
                </div>
            </div>
        </div>
        <div class="disc-body">
            <p>
                {$_('disclaimer.body1')}
            </p>
            <p>
                {@html $_('disclaimer.body2')}
            </p>
        </div>
        <div class="disc-footer">
            <button
                class="disc-remind"
                id="disc-dismiss"
                onclick={hideOverlay}>{$_('disclaimer.dismiss')}</button
            >
            <button
                class="disc-ok-btn"
                id="disc-ok"
                onclick={acceptDisclaimer}>{$_('disclaimer.ok')}</button
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
        font-family: 'Manjari', sans-serif;
        font-weight: 700;
        font-size: 22px;
        color: var(--text);
        margin-bottom: 3px;
    }

    .disc-subtitle {
        font-family: 'Manjari', monospace;
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
        font-family: 'Manjari', monospace;
        font-size: 11px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        cursor: pointer;
        transition: background 0.2s;
        font-weight: 500;
    }
    .disc-ok-btn:hover { background: var(--gold); }

    .disc-remind {
        font-family: 'Manjari', monospace;
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
