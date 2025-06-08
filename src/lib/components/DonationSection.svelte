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

<section class="donation-section">
	<div class="donation-content">
		<h2>{m['donation.title']()}</h2>
		<p class="description">{m['donation.description']()}</p>

		<div class="amount-display">
			<span class="label">{m['donation.amount']()}: </span>
			<span class="amount">{formatPrice(currentAmount, currency)}</span>
		</div>

		<button class="donate-button" onclick={onDonate}>
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 16px;
        padding: 3rem;
        margin: 3rem 0;
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 3rem;
        align-items: center;
        position: relative;
        overflow: hidden;
    }

    .donation-content {
        z-index: 1;
    }

    h2 {
        font-size: 2rem;
        margin-bottom: 1rem;
        font-weight: 700;
    }

    .description {
        font-size: 1.1rem;
        line-height: 1.8;
        margin-bottom: 2rem;
        opacity: 0.95;
    }

    .amount-display {
        background: rgba(255, 255, 255, 0.2);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        display: inline-block;
        margin-bottom: 2rem;
        backdrop-filter: blur(10px);
    }

    .amount-display .label {
        font-size: 0.9rem;
        opacity: 0.9;
    }

    .amount-display .amount {
        font-size: 1.5rem;
        font-weight: bold;
        margin-left: 0.5rem;
    }

    .donate-button {
        background: white;
        color: #764ba2;
        border: none;
        padding: 16px 32px;
        border-radius: 50px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .donate-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
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

    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
    }

    @keyframes float {
        0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.8;
        }
        50% {
            transform: translateY(-30px) rotate(180deg);
            opacity: 1;
        }
    }

    @media (max-width: 768px) {
        .donation-section {
            grid-template-columns: 1fr;
            padding: 2rem;
            text-align: center;
        }

        .illustration {
            margin: 0 auto;
        }

        h2 {
            font-size: 1.5rem;
        }

        .description {
            font-size: 1rem;
        }
    }
</style>