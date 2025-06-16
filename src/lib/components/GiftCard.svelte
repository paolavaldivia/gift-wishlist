<script lang="ts">
	import type { Gift } from '$lib/types/gift';
	import * as m from '$lib/paraglide/messages';
	import WaveClipPath from './WaveClipPath.svelte';

	let { gift, onReserve }: { gift: Gift; onReserve?: (giftId: string) => void } = $props();

	// Add debugging
	console.log(`GiftCard ${gift.id} rendered:`, {
		name: gift.name,
		isTaken: gift.isTaken,
		takenBy: gift.takenBy
	});

	function handleReserve() {
		if (!gift.isTaken && onReserve) {
			onReserve(gift.id);
		}
	}

	function formatPrice(price: number, currency: string) {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: currency
		}).format(price);
	}
</script>

<WaveClipPath />
<article class="gift-card card" class:taken={gift.isTaken} data-testid="gift-card">
	<div class="image-container">
		<img src={gift.imagePath} alt={gift.name} class="splat-clip" />
		{#if gift.isTaken}
			<div class="taken-overlay">
				<span class="taken-text">{m['giftList.alreadyTaken']()}</span>
			</div>
		{/if}
	</div>

	<div class="content">
		<h3>{gift.name}</h3>
		<p class="description">{gift.description}</p>

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

		{#if gift.isTaken && gift.takenBy}
			<div class="taken-by">
				<span class="label">{m['giftList.taken']()}: </span>
				<span class="name">{gift.takenBy}</span>
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
	</div>
</article>

<style>
    .gift-card {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .gift-card.taken {
        opacity: 0.8;
    }

    .image-container {
        position: relative;
        width: 100%;
        height: 200px;
        overflow: hidden;
        background: var(--color-gray-50);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .image-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--transition-base);
    }

    .image-container:hover img {
        transform: scale(1.05);
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

    .content {
        padding: var(--spacing-lg);
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    h3 {
        margin: 0;
        font-size: var(--font-size-xl);
        color: var(--color-gray-800);
    }

    .description {
        color: var(--color-gray-500);
        font-size: var(--font-size-sm);
        line-height: var(--line-height-normal);
        margin: 0;
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
        text-decoration: none;
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
    }

    .taken-by .name {
        color: var(--color-danger);
        font-weight: var(--font-weight-bold);
    }

    .reserve-button {
        margin-top: auto;
        width: 100%;
    }
</style>