<script lang="ts">
	import type { Gift } from '$lib/types/gift';
	import * as m from '$lib/paraglide/messages';

	let { gift, onReserve }: { gift: Gift; onReserve?: (giftId: string) => void } = $props();

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

<article class="gift-card" class:taken={gift.isTaken}>
	<div class="image-container">
		<img src={gift.imagePath} alt={gift.name} />
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
				class="reserve-button"
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
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .gift-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
    }

    .gift-card.taken {
        opacity: 0.8;
    }

    .image-container {
        position: relative;
        width: 100%;
        height: 200px;
        overflow: hidden;
        background: #f8f9fa;
    }

    .image-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
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
        color: white;
        font-size: 1.2rem;
        font-weight: bold;
        background: #e74c3c;
        padding: 8px 16px;
        border-radius: 4px;
        transform: rotate(-15deg);
    }

    .content {
        padding: 1.5rem;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    h3 {
        margin: 0;
        font-size: 1.25rem;
        color: #2c3e50;
    }

    .description {
        color: #7f8c8d;
        font-size: 0.9rem;
        line-height: 1.5;
        margin: 0;
    }

    .price, .purchase-links, .taken-by {
        font-size: 0.9rem;
    }

    .label {
        color: #7f8c8d;
        font-weight: 500;
    }

    .value {
        color: #27ae60;
        font-weight: bold;
        font-size: 1.1rem;
    }

    .links {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 0.25rem;
    }

    .purchase-link {
        color: #3498db;
        text-decoration: none;
        padding: 4px 8px;
        background: #ecf0f1;
        border-radius: 4px;
        font-size: 0.85rem;
        transition: background-color 0.2s ease;
    }

    .purchase-link:hover {
        background: #d5dbdb;
        text-decoration: underline;
    }

    .taken-by {
        margin-top: auto;
        padding-top: 0.5rem;
        border-top: 1px solid #ecf0f1;
    }

    .taken-by .name {
        color: #e74c3c;
        font-weight: bold;
    }

    .reserve-button {
        margin-top: auto;
        background: #3498db;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s ease;
        width: 100%;
    }

    .reserve-button:hover:not(:disabled) {
        background: #2980b9;
    }

    .reserve-button:disabled {
        background: #bdc3c7;
        cursor: not-allowed;
    }
</style>