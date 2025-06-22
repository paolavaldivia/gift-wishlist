<script lang="ts">
	import type { BigGift } from '$lib/types/gift';
	import Card from '$lib/components/Card.svelte';
	import * as m from '$lib/paraglide/messages';
	import { formatPrice } from '$lib/util/format';
	import GoalProgress from '$lib/components/GoalProgress.svelte';

	let { bigGift, onContribute }: { bigGift: BigGift; onContribute?: (bigGiftId: string) => void } = $props();

	function handleContribute() {
		if(isGoalReached) return;
		onContribute?.(bigGift.id);
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
				<GoalProgress
					{...{ 'data-testid': 'goal-progress' }}
					currentAmount={bigGift.currentAmount}
					targetAmount={bigGift.targetAmount}
					currency={bigGift.currency}
					/>

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
					onclick={handleContribute}
					disabled={isGoalReached}
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

</style>