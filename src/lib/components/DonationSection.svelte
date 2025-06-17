<!-- src/lib/components/DonationSection.svelte -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { slide } from 'svelte/transition';

	let {
		onDonate
	}: {
		onDonate?: () => void;
	} = $props();

	let showPaymentOptions = $state(false);

	function togglePaymentOptions() {
		showPaymentOptions = !showPaymentOptions;
	}
</script>

<section class="donation-section gradient-subtle">
	<div class="donation-content">
		<h2>{m['donation.title']()}</h2>
		<p class="description">{m['donation.description']()}</p>

		<button class="btn btn-primary donate-button" onclick={togglePaymentOptions}>
			{m['donation.button']()}
		</button>

		{#if showPaymentOptions}
			<div class="payment-options" transition:slide={{ duration: 300 }}>
				<div class="payment-option">
					<h3>{m['donation.bankTransfer']()}</h3>
					<div class="rib-details">
						<div class="rib-row">
							<span class="rib-label">IBAN:</span>
							<span class="rib-value">FR76 1234 5678 9012 3456 7890 123</span>
						</div>
						<div class="rib-row">
							<span class="rib-label">BIC:</span>
							<span class="rib-value">ABCDEFGHIJK</span>
						</div>
						<div class="rib-row">
							<span class="rib-label">{m['donation.accountHolder']()}:</span>
							<span class="rib-value">Céline & Paola</span>
						</div>
					</div>
				</div>

				<div class="payment-option">
					<h3>PayPal</h3>
					<p>{m['donation.paypalDescription']()}</p>
					<a href="https://paypal.me/yourpaypallink" target="_blank" rel="noopener noreferrer" class="btn btn-paypal">
						<span class="paypal-icon">💸</span> {m['donation.paypalButton']()}
					</a>
				</div>
			</div>
		{/if}
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
        color: var(--color-accent-dark);
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
        color: var(--color-accent-dark);
    }

    .description {
        font-size: var(--font-size-lg);
        line-height: var(--line-height-loose);
        margin-bottom: var(--spacing-xl);
        opacity: 0.95;
    }
		
    .donate-button {
        font-size: var(--font-size-lg);
        padding: var(--spacing-md) var(--spacing-2xl);
        border-radius: var(--radius-full);
    }

    /* Payment options styles */
    .payment-options {
        margin-top: var(--spacing-xl);
        display: grid;
        gap: var(--spacing-xl);
        background: var(--color-white);
        padding: var(--spacing-lg);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
    }

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

    .item:nth-child(1) {
        top: 10%;
        left: 10%;
    }

    .item:nth-child(2) {
        top: 20%;
        right: 10%;
    }

    .item:nth-child(3) {
        bottom: 20%;
        left: 15%;
    }

    .item:nth-child(4) {
        bottom: 10%;
        right: 20%;
    }

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

        .rib-row {
            flex-direction: column;
            gap: var(--spacing-xs);
        }

        .rib-label {
            min-width: auto;
        }
    }
</style>