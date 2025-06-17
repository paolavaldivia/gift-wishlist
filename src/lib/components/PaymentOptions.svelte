<script lang="ts">
    import * as m from '$lib/paraglide/messages';
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import CopyIcon from '$lib/components/icons/CopyIcon.svelte';

    export let show = false;
    export let iban = 'FR76 3000 3022 1600 0570 0472 409';
    export let bic = 'SOGEFRPP';
    export let accountHolder = 'MME LLERENA VALDIVIA OU MME DA SILVA';
    export let paypalLink = 'https://paypal.me/valdiviap';
    export let onClose = () => { show = false; };

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
    }

    function copyIbanWithoutSpaces() {
        const ibanNoSpaces = iban.replace(/\s+/g, '');
        copyToClipboard(ibanNoSpaces);
    }

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            onClose();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            onClose();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
    <div 
        class="modal-backdrop" 
        onclick={handleBackdropClick}
        transition:fade={{ duration: 200 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-options-title"
        tabindex="-1"
    >
        <div 
            class="modal-content"
            transition:fly={{
                y: 50,
                duration: 300,
                easing: quintOut
            }}
        >
            <!-- Modal Header -->
            <header class="modal-header">
                <h2 id="payment-options-title">{m['donation.title']()}</h2>
                <button
                    class="close-button"
                    onclick={onClose}
                    aria-label="Close modal"
                >
                    ×
                </button>
            </header>

            <div class="modal-body">
                <div class="payment-option">
                    <h3>{m['donation.bankTransfer']()}</h3>
                    <div class="rib-details">
                        <div class="rib-row">
                            <span class="rib-label">IBAN:</span>
                            <span class="rib-value">{iban}</span>
                            <button class="copy-btn" onclick={copyIbanWithoutSpaces} title="Copy IBAN without spaces">
                                <CopyIcon />
                            </button>
                        </div>
                        <div class="rib-row">
                            <span class="rib-label">BIC:</span>
                            <span class="rib-value">{bic}</span>
                            <button class="copy-btn" onclick={() => copyToClipboard(bic)} title="Copy BIC">
                                <CopyIcon />
                            </button>
                        </div>
                        <div class="rib-row">
                            <span class="rib-label">{m['donation.accountHolder']()}:</span>
                            <span class="rib-value">{accountHolder}</span>
                            <button class="copy-btn" onclick={() => copyToClipboard(accountHolder)} title="Copy account holder name">
                                <CopyIcon />
                            </button>
                        </div>
                    </div>
                </div>

                <div class="payment-option">
                    <h3>PayPal</h3>
                    <p>{m['donation.paypalDescription']()}</p>
                    <a href={paypalLink} target="_blank" rel="noopener noreferrer" class="btn btn-paypal">
                        <span class="paypal-icon">💸</span> {m['donation.paypalButton']()}
                    </a>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: var(--z-modal);
        padding: var(--spacing-lg);
    }

    .modal-content {
        background: var(--color-white);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-xl);
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
        border-bottom: 1px solid var(--color-gray-200);
    }

    .modal-header h2 {
        margin: 0;
        font-size: var(--font-size-2xl);
        color: var(--color-gray-800);
    }

    .close-button {
        background: none;
        border: none;
        font-size: 2rem;
        color: var(--color-gray-500);
        cursor: pointer;
        padding: 0;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
    }

    .close-button:hover {
        background: var(--color-gray-100);
        color: var(--color-gray-700);
    }

    .modal-body {
        padding: var(--spacing-xl);
        display: grid;
        gap: var(--spacing-xl);
    }

    /* Payment options styles */
    .payment-option {
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        background: var(--color-gray-50);
    }

    .payment-option h3 {
        font-size: var(--font-size-xl);
        margin-bottom: var(--spacing-sm);
        color: var(--color-primary);
    }

    .rib-details {
        display: grid;
        gap: var(--spacing-xs);
    }

    .rib-row {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
        align-items: center;
    }

    .rib-label {
        font-weight: var(--font-weight-semibold);
        min-width: 120px;
    }

    .rib-value {
        font-family: monospace;
        background: var(--color-white);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-gray-200);
    }

    .btn-paypal {
        background: #0070ba;
        color: white;
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-sm);
        text-decoration: none;
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--radius-full);
        transition: all var(--transition-fast);
    }

    .btn-paypal:hover {
        background: #005ea6;
        transform: translateY(-2px);
    }

    .paypal-icon {
        font-size: 1.2em;
    }

    /* Copy button styles */
    .copy-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0.4em;
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-gray-500);
    }

    .copy-btn:hover {
        background: var(--color-gray-100);
        transform: scale(1.1);
        color: var(--color-primary);
    }

    .copy-btn:active {
        transform: scale(0.95);
    }

    @media (max-width: 768px) {
        .modal-backdrop {
            padding: var(--spacing-md);
        }

        .modal-content {
            max-height: 95vh;
        }

        .rib-row {
            flex-direction: row;
            flex-wrap: wrap;
            gap: var(--spacing-xs);
            align-items: center;
        }

        .rib-label {
            min-width: auto;
            margin-right: auto;
        }
    }
</style>