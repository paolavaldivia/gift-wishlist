<script lang="ts">
	import type { Gift } from '$lib/types/gift';
	import { formatPrice } from '$lib/util/format';
	import * as m from '$lib/paraglide/messages';
	import Card from '$lib/components/Card.svelte';

	let { gift, onReserve }: { gift: Gift; onReserve?: (giftId: string) => void } = $props();

	function handleReserve() {
		if (!gift.isTaken && onReserve) {
			onReserve(gift.id);
		}
	}

	function getReserverDisplayName(gift: Gift): string {
		if (!gift.isTaken) return '';

		if (gift.hideReserverName || !gift.takenBy) {
			return m['giftList.anonymousReserver']();
		}

		return gift.takenBy;
	}
</script>

<Card
	{...{'data-testid': 'gift-card'}}
	class={{ 'gift-card': true, taken: gift.isTaken }}
	title={gift.name}
	description={gift.description}
	imagePath={gift.imagePath}
>
	{#snippet imageOverlay()}
		{#if gift.isTaken}
			<div class="taken-overlay">
				<span class="taken-text">{m['giftList.alreadyTaken']()}</span>
			</div>
		{/if}
	{/snippet}

	{#snippet content()}
		<div class="price">
			<span class="label">{m['giftList.approximatePrice']()}: </span>
			<span class="value">{formatPrice(gift.approximatePrice, gift.currency)}</span>
		</div>

		<div class="purchase-links">
			<span class="label">{m['giftList.buyAt']()}: </span>
			<div class="links">
				{#each gift.purchaseLinks as link (link.url)}
					<a href={link.url} target="_blank" rel="noopener noreferrer" class="purchase-link">
						{link.siteName}
					</a>
				{/each}
			</div>
		</div>
	{/snippet}

	{#snippet actionContent()}
		{#if gift.isTaken}
			<div class="taken-by" class:anonymous={gift.hideReserverName || !gift.takenBy}>
				<span class="label">{m['giftList.taken']()} </span>
				<span class="name">{getReserverDisplayName(gift)}</span>
				{#if gift.hideReserverName}
					<span class="privacy-indicator" title={m['giftList.privacyEnabled']()}>🔒</span>
				{/if}
			</div>
		{:else}
			<button
				class="btn btn-primary reserve-button"
				onclick={handleReserve}
				disabled={gift.isTaken}
			>
				{m['giftList.reserve']()}
			</button>
		{/if}
	{/snippet}
</Card>

<style>
    :global(.gift-card.taken) {
        opacity: 0.8;
    }

    .taken-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .taken-text {
        color: var(--color-white);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        background: var(--color-danger);
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--radius-sm);
        transform: rotate(-15deg);
    }

    .price, .purchase-links, .taken-by {
        font-size: var(--font-size-sm);
    }

    .label {
        color: var(--color-gray-500);
        font-weight: var(--font-weight-medium);
    }

    .value {
        color: var(--color-success);
        font-weight: var(--font-weight-bold);
        font-size: var(--font-size-lg);
    }

    .links {
        display: flex;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
        margin-top: var(--spacing-xs);
    }

    .purchase-link {
        color: var(--color-primary);
        text-decoration: underline;
        text-decoration-color: var(--color-secondary);
        text-underline-offset: 0.1rem;
        text-decoration-thickness: 0.5px;
        padding: var(--spacing-xs) var(--spacing-sm);
        background: var(--color-gray-100);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-sm);
        transition: background-color var(--transition-fast);
    }

    .purchase-link:hover {
        background: var(--color-gray-200);
        text-decoration: underline;
    }

    .taken-by {
        margin-top: auto;
        padding-top: var(--spacing-sm);
        border-top: 1px solid var(--color-gray-100);
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
    }

    .taken-by .name {
        color: var(--color-danger);
        font-weight: var(--font-weight-bold);
    }

    .taken-by.anonymous .name {
        color: var(--color-gray-500);
        font-style: italic;
    }

    .privacy-indicator {
        font-size: var(--font-size-sm);
        opacity: 0.7;
        cursor: help;
    }

    .reserve-button {
        margin-top: var(--spacing-md);
        width: 100%;
    }
</style>