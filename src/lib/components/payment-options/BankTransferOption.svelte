<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import CopyIcon from '$lib/components/icons/CopyIcon.svelte';

	export let iban = 'FR76 3000 3022 1600 0570 0472 409';
	export let bic = 'SOGEFRPP';
	export let accountHolder = 'MME LLERENA VALDIVIA OU MME DA SILVA';

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
	}

	function copyIbanWithoutSpaces() {
		const ibanNoSpaces = iban.replace(/\s+/g, '');
		copyToClipboard(ibanNoSpaces);
	}
</script>
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


<style>
		
    .rib-details {
        display: grid;
        gap: var(--spacing-xs);
    }

    .rib-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .rib-label {
        font-weight: var(--font-weight-semibold);
        min-width: 120px;
        flex-shrink: 0;
    }

    .rib-value {
        font-family: monospace;
        background: var(--color-white);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-gray-200);
        flex: 1;
        overflow: auto;
        white-space: nowrap;
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
        flex-shrink: 0;
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
        .rib-row {
            display: grid;
            grid-template-columns: 1fr auto;
            grid-template-areas:
                "label label"
                "value button";
            gap: var(--spacing-xs);
            margin-bottom: var(--spacing-sm);
        }

        .rib-label {
            grid-area: label;
            min-width: auto;
            width: 100%;
        }

        .rib-value {
            grid-area: value;
            width: 100%;
        }

        .copy-btn {
            grid-area: button;
            align-self: center;
        }
    }
</style>