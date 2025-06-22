<script lang="ts">
	import type { BigGift } from '$lib/types/gift';
	import Card from '$lib/components/Card.svelte';
	import * as m from '$lib/paraglide/messages';
	import { formatPrice } from '$lib/util/format';

	let { bigGift }: { bigGift: BigGift; } = $props();

	function getProgressPercentage(): number {
		if (bigGift.targetAmount === 0) return 0;
		return Math.min((bigGift.currentAmount / bigGift.targetAmount) * 100, 100);
	}

	function getRemainingAmount(): number {
		return Math.max(bigGift.targetAmount - bigGift.currentAmount, 0);
	}

	let isGoalReached = $derived(bigGift.currentAmount >= bigGift.targetAmount);

</script>

<Card
	{...{ 'data-testid': 'big-gift-card' }}
	class={{ 'big-gift-card': true, 'goal-reached': isGoalReached}}
	title={bigGift.name}
	description={bigGift.description}
	imagePath={bigGift.imagePath}
>
	{#snippet imageOverlay()}
		{#if isGoalReached}
			<div class="goal-reached-overlay">
				<span class="goal-reached-text">🎯 {m['giftList.goalReached']()}</span>
			</div>
		{/if}
	{/snippet}

	{#snippet content()}
		{#if isGoalReached}
			<div class="gift-target">
				<span class="value">{formatPrice(bigGift.targetAmount, bigGift.currency)}</span>
			</div>
		{/if}

		{#if !isGoalReached}
			<div class="progress-section">
				<div class="progress-info">
					<div class="current-amount">
						<span class="label">raised</span>
						<span class="amount">{formatPrice(bigGift.currentAmount, bigGift.currency)}</span>
					</div>
					<div class="remaining-amount">
						<span class="label">remaining</span>
						<span class="amount">{formatPrice(getRemainingAmount(), bigGift.currency)}</span>
					</div>
				</div>

				<div class="progress-bar-container" role="progressbar"
						 aria-valuenow={getProgressPercentage()}
						 aria-valuemin="0"
						 aria-valuemax="100"
						 aria-label="Contribution progress">
					<div class="progress-bar" style:width="{getProgressPercentage()}%"></div>
				</div>
			</div>
		{/if}

	{/snippet}

	{#snippet actionContent()}
		{#if bigGift.contributors.length > 0}
		<div class="contributors-preview">
			<h4 class="contributors-title">{m['giftList.taken']()}</h4>
			<div class="contributors-list">
				{#each bigGift.contributors as contributor (contributor.id)}
					<div class="contributor-item">
						<span class="contributor-name">{contributor.name}</span>
						<span class="contributor-amount">{formatPrice(contributor.amount, bigGift.currency)}</span>
					</div>
				{/each}
			</div>
		</div>
		{/if}
		{#if !isGoalReached}
			<div class="gift-actions">
				<button
					class="btn btn-primary contribute-button"
					onclick={() => {
						// todo
					}}
				>
					{m['giftList.contribute']()}
				</button>
			</div>
		{/if}

	{/snippet}
</Card>

<style>
    :global(.big-gift-card.goal-reached) {
        opacity: 0.8;
    }

    .goal-reached-overlay {
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

    .goal-reached-text {
        color: var(--color-white);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        background: var(--color-danger);
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--radius-sm);
        transform: rotate(-15deg);
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

    .progress-section {
        display: flex;
        flex-direction: column;
				margin-top: var(--spacing-md);
    }

    .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .current-amount,
    .remaining-amount {
        display: flex;
        flex-direction: column;
    }

    .current-amount .amount {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--color-success);
        align-items: start;
        text-align: start;
    }

    .remaining-amount .amount {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
        align-items: end;
        text-align: end;
    }

    .progress-info .label {
        font-size: var(--font-size-sm);
        color: var(--color-gray-500);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .progress-bar-container {
        position: relative;
        width: 100%;
        height: 8px;
        background: var(--color-gray-100);
        border-radius: var(--radius-full);
        overflow: hidden;
    }

    .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-success) 100%);
        border-radius: var(--radius-full);
        transition: width 0.8s ease;
        position: relative;
    }

    .progress-bar::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
        animation: shimmer 4s infinite;
    }

    @keyframes shimmer {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(100%);
        }
    }

    .progress-percentage {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .contributors-preview {
        border-top: 1px solid var(--color-gray-100);
        padding-top: var(--spacing-md);
    }

    .contributors-title {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-gray-700);
    }

    .contributors-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }

    .contributor-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--font-size-sm);
    }

    .contributor-name {
        color: var(--color-gray-600);
        flex: 1;
        truncate: true;
    }

    .contributor-amount {
        font-weight: var(--font-weight-semibold);
        color: var(--color-success);
    }

    .more-contributors {
        font-size: var(--font-size-xs);
        color: var(--color-gray-500);
        font-style: italic;
        text-align: center;
        padding-top: var(--spacing-xs);
    }

    .purchase-links {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }

    .links-label {
        font-size: var(--font-size-sm);
        color: var(--color-gray-600);
        font-weight: var(--font-weight-medium);
    }

    .links-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-xs);
    }

    .purchase-link {
        display: inline-flex;
        align-items: center;
        padding: var(--spacing-xs) var(--spacing-sm);
        background: var(--color-gray-50);
        color: var(--color-primary);
        text-decoration: none;
        border-radius: var(--radius-sm);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        border: 1px solid var(--color-gray-200);
        transition: all 0.2s ease;
    }

    .purchase-link:hover {
        background: var(--color-primary);
        color: white;
        transform: translateY(-1px);
    }

    .gift-actions {
        margin-top: auto;
        padding-top: var(--spacing-md);
    }

    .contribute-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-semibold);
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
    }

    .btn-icon {
        font-size: var(--font-size-lg);
    }

    .status-message {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        font-weight: var(--font-weight-semibold);
        text-align: center;
    }

    .status-message.purchased {
        background: var(--color-success-light);
        color: var(--color-success-dark);
        border: 1px solid var(--color-success);
    }

    .status-message.ready {
        background: var(--color-info-light);
        color: var(--color-info-dark);
        border: 1px solid var(--color-info);
    }

    .status-icon {
        font-size: var(--font-size-lg);
    }

    .contribute-button {
        margin-top: var(--spacing-md);
        width: 100%;
    }

    /* Responsive Design */
    @media (max-width: 768px) {

        .progress-info {
            gap: var(--spacing-sm);
        }

        .current-amount,
        .remaining-amount {
            flex: 1;
        }

        .links-list {
            flex-direction: column;
        }

        .purchase-link {
            text-align: center;
        }
    }

    /* Accessibility */
    @media (prefers-reduced-motion: reduce) {
        .big-gift-card,
        .gift-image,
        .progress-bar,
        .purchase-link {
            transition: none;
        }

        .big-gift-card:hover {
            transform: none;
        }

        .big-gift-card:hover .gift-image {
            transform: none;
        }

        .progress-bar::after {
            animation: none;
        }
    }

    /* Focus styles for keyboard navigation */
    .contribute-btn:focus-visible,
    .purchase-link:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }

</style>