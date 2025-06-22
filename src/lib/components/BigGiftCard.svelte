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
						<span class="contributor-name">{contributor.hideContributorName ? m['giftList.anonymousReserver']() : contributor.name}</span>
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

    .contributors-preview {
        border-top: 1px solid var(--color-gray-100);
        padding-top: var(--spacing-md);
    }

    .contributors-title {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-gray-500);
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

    .gift-actions {
        margin-top: auto;
        padding-top: var(--spacing-md);
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
    }

    /* Accessibility */
    @media (prefers-reduced-motion: reduce) {
				.progress-bar {
            transition: none;
        }
    }

</style>