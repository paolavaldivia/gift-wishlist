<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import PaymentOptions from './PaymentOptions.svelte';

	let showPaymentOptions = $state(false);

	function togglePaymentOptions() {
		showPaymentOptions = !showPaymentOptions;
	}
	
	function closePaymentOptions() {
		showPaymentOptions = false;
	}
</script>

<section class="donation-section gradient-subtle">
	<div class="donation-content">
		<h2>{m['donation.title']()}</h2>
		<p class="description">{m['donation.description']()}</p>

		<button class="btn btn-primary donate-button" on:click={togglePaymentOptions}>
			{m['donation.button']()}
		</button>

		<PaymentOptions show={showPaymentOptions} onClose={closePaymentOptions} />
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
    }
</style>