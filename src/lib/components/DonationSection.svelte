<!-- src/lib/components/DonationSection.svelte -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	let {
		currentAmount = 0,
		currency = 'EUR',
		onDonate
	}: {
		currentAmount?: number;
		currency?: string;
		onDonate?: () => void;
	} = $props();

	function formatPrice(price: number, currency: string) {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: currency
		}).format(price);
	}
</script>

<section class="donation-section gradient-primary">
	<div class="donation-content">
		<h2>{m['donation.title']()}</h2>
		<p class="description">{m['donation.description']()}</p>

		<div class="amount-display">
			<span class="label">{m['donation.amount']()}: </span>
			<span class="amount">{formatPrice(currentAmount, currency)}</span>
		</div>

		<button class="btn btn-secondary donate-button" onclick={onDonate}>
			{m['donation.button']()}
		</button>
	</div>

	<div class="illustration">
		<div class="baby-icon">👶</div>
		<div class="floating-items">
			<span class="item" style="--delay: 0s">🍼</span>
			<span class="item" style="--delay: 0.5s">🧸</span>
			<span class="item" style="--delay: 1s">👶🏻</span>
			<span class="item" style="--delay: 1.5s">🎁</span>
		</div>
	</div>
</section>

<style>
    .donation-section {
        color: var(--color-white);
        border-radius: var(--radius-xl);
        padding: var(--spacing-2xl);
        margin: var(--spacing-2xl) 0;
        display: grid;
        grid-template-columns: 1fr auto;
        gap: var(--spacing-2xl);
        align-items: center;
        position: relative;
        overflow: hidden;
    }

    .donation-content {
        z-index: var(--z-base);
    }

    h2 {
        font-size: var(--font-size-3xl);
        margin-bottom: var(--spacing-md);
        font-weight: var(--font-weight-bold);
        color: var(--color-white);
    }

    .description {
        font-size: var(--font-size-lg);
        line-height: var(--line-height-loose);
        margin-bottom: var(--spacing-xl);
        opacity: 0.95;
    }

    .amount-display {
        background: rgba(255, 255, 255, 0.2);
        padding: var(--spacing-md) var(--spacing-lg);
        border-radius: var(--radius-md);
        display: inline-block;
        margin-bottom: var(--spacing-xl);
        backdrop-filter: blur(10px);
    }

    .amount-display .label {
        font-size: var(--font-size-sm);
        opacity: 0.9;
    }

    .amount-display .amount {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        margin-left: var(--spacing-sm);
    }

    .donate-button {
        font-size: var(--font-size-lg);
        padding: var(--spacing-md) var(--spacing-2xl);
        border-radius: var(--radius-full);
    }

    .illustration {
        position: relative;
        width: 200px;
        height: 200px;
    }

    .baby-icon {
        font-size: 5rem;
        text-align: center;
        animation: bounce 2s ease-in-out infinite;
    }

    .floating-items {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
    }

    .item {
        position: absolute;
        font-size: 2rem;
        animation: float 3s ease-in-out infinite;
        animation-delay: var(--delay);
    }

    .item:nth-child(1) { top: 10%; left: 10%; }
    .item:nth-child(2) { top: 20%; right: 10%; }
    .item:nth-child(3) { bottom: 20%; left: 15%; }
    .item:nth-child(4) { bottom: 10%; right: 20%; }

    @media (max-width: 768px) {
        .donation-section {
            grid-template-columns: 1fr;
            padding: var(--spacing-xl);
            text-align: center;
        }

        .illustration {
            margin: 0 auto;
        }

        h2 {
            font-size: var(--font-size-2xl);
        }

        .description {
            font-size: var(--font-size-base);
        }
    }
</style>