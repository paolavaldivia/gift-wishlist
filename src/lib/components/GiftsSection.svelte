<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages.js';
	import GiftCard from '$lib/components/GiftCard.svelte';
	import ReservationModal from '$lib/components/ReservationModal.svelte';
	import type { BigGift, Gift } from '$lib/types/gift';
	import type { ActionData } from '../../../.svelte-kit/types/src/routes/$types';
	import BigGiftCard from '$lib/components/BigGiftCard.svelte';
	import GiftContributionModal from '$lib/components/GiftContributionModal.svelte';

	let { gifts, bigGifts, onShowError, onHideError, form }: {
		gifts: Gift[],
		bigGifts: BigGift[];
		onShowError?: (message: string) => void;
		onHideError?: () => void;
		form?: ActionData;
	} = $props();

	let selectedGift = $state<Gift | null>(null);
	let selectedBigGift = $state<BigGift | null>(null);

	let filterMode = $state<'all' | 'available'>('all');
	let lastFormResult = $state<string | null>(null);

	let filteredGifts = $derived(
		filterMode === 'all'
			? gifts
			: gifts.filter(gift => !gift.isTaken)
	);

	let filteredBigGifts = $derived(
		filterMode === 'all'
			? bigGifts
			: bigGifts.filter(gift => gift.targetAmount > gift.currentAmount)
	);

	let availableGiftsCount = $derived(gifts.filter(gift => !gift.isTaken).length + bigGifts.filter(gift => gift.targetAmount > gift.currentAmount).length
	);

	$effect(() => {
		if (form && 'success' in form) {
			const formId = `${form.success}-${form.gift?.id || 'none'}-${Date.now()}`;

			if (formId !== lastFormResult) {
				lastFormResult = formId;

				if (form.success && form.gift) {
					// Update gifts array with the new data
					gifts = gifts.map(g =>
						g.id === form.gift.id ? { ...g, ...form.gift } : g
					);
				} else if (!form.success) {
					showErrorNotification(form.message || 'Unknown error');
					closeReserveModal();
				}
			}
		}
	});

	function showErrorNotification(message: string) {
		onShowError?.(message);
		setTimeout(() => {
			onHideError?.();
		}, 5000);
	}

	function openReserveModal(giftId: string) {
		const gift = gifts.find(g => g.id === giftId);
		if (gift && !gift.isTaken) {
			selectedGift = gift;
		}
	}

	function openContributeModal(bigGiftId: string) {
		const bigGift = bigGifts.find(g => g.id === bigGiftId);
		if (bigGift && bigGift.targetAmount > bigGift.currentAmount) {
			selectedBigGift = bigGift;
		}
	}

	function handleReserve(event: CustomEvent<{ giftId: string; name: string; hideReserverName: boolean }>) {
		const { giftId, name, hideReserverName } = event.detail;

		const giftIdInput = document.getElementById('gift-id') as HTMLInputElement;
		const nameInput = document.getElementById('gift-name') as HTMLInputElement;
		const hideNameInput = document.getElementById('gift-hide-reserver-name') as HTMLInputElement;
		const form = document.getElementById('gift-reservation-form') as HTMLFormElement;

		if (giftIdInput && nameInput && hideNameInput && form) {
			giftIdInput.value = giftId;
			nameInput.value = name;
			hideNameInput.value = hideReserverName.toString();
			form.requestSubmit();
		}
	}

	function handleContribute(event: CustomEvent<{ bigGiftId: string; amount: number; name: string; email?: string; message?: string; hideContributorName?: boolean }>) {
		const { bigGiftId, amount, name, email, message, hideContributorName } = event.detail;

		const bigGiftIdInput = document.getElementById('big-gift-id') as HTMLInputElement;
		const amountInput = document.getElementById('contribution-amount') as HTMLInputElement;
		const nameInput = document.getElementById('contributor-name') as HTMLInputElement;
		const emailInput = document.getElementById('contributor-email') as HTMLInputElement;
		const messageInput = document.getElementById('contributor-message') as HTMLInputElement;
		const hideNameInput = document.getElementById('hide-contributor-name') as HTMLInputElement;
		const form = document.getElementById('big-gift-contribution-form') as HTMLFormElement;

		if (bigGiftIdInput && amountInput && nameInput && emailInput && messageInput && hideNameInput && form) {
			bigGiftIdInput.value = bigGiftId;
			amountInput.value = amount.toString();
			nameInput.value = name;
			emailInput.value = email || '';
			messageInput.value = message || '';
			hideNameInput.value = hideContributorName?.toString() || 'false';
			form.requestSubmit();
		}
	}

	function closeReserveModal() {
		selectedGift = null;
	}

	function closeContributeModal() {
		selectedBigGift = null;
	}
</script>

<section class="gift-section">
	<h2>{m['giftList.title']()}</h2>
	<p class="section-description">{m['giftList.description']()}</p>

	<!-- Filter controls -->
	<div class="filter-controls">
		<button
			class="filter-button"
			class:active={filterMode === 'all'}
			onclick={() => filterMode = 'all'}
		>
			{m['giftList.showAll']()}
		</button>
		<button
			class="filter-button"
			class:active={filterMode === 'available'}
			onclick={() => filterMode = 'available'}
		>
			{m['giftList.showAvailable']()} ({availableGiftsCount})
		</button>
	</div>

	<div class="gift-grid">
		{#each filteredGifts as gift (gift.id)}
			<GiftCard
				{gift}
				onReserve={openReserveModal}
			/>
		{/each}
		{#each filteredBigGifts as bigGift (bigGift.id)}
			<BigGiftCard
				{bigGift}
				onContribute={openContributeModal}
			/>
		{/each}
	</div>
</section>


<form
	id="gift-reservation-form"
	method="POST"
	action="?/reserveGift"
	use:enhance={() => {
		return ({ update }) => {
			update({ reset: false });
		};
	}}
	style="display: none;"
>
	<input id="gift-id" type="hidden" name="giftId" value="" />
	<input id="gift-name" type="hidden" name="name" value="" />
	<input id="gift-hide-reserver-name" type="hidden" name="hideReserverName" value="" />
</form>


<form
	id="big-gift-contribution-form"
	method="POST"
	action="/?donateBigGift"
	use:enhance={() => {
		return ({ update }) => {
			update({ reset: false });
		};
	}
}>
	<input type="hidden" id="big-gift-id" name="bigGiftId" />
	<input type="hidden" id="contribution-amount" name="amount" />
	<input type="hidden" id="contributor-name" name="name" />
	<input type="hidden" id="contributor-email" name="email" />
	<input type="hidden" id="contributor-message" name="message" />
	<input type="hidden" id="hide-contributor-name" name="hideContributorName" />
</form>


<ReservationModal
	gift={selectedGift}
	isOpen={selectedGift !== null}
	close={closeReserveModal}
	reserve={handleReserve}
/>

<GiftContributionModal
	bigGift={selectedBigGift}
	isOpen={selectedBigGift !== null}
	close={closeContributeModal}
	contribute={handleContribute}
/>

<style>


    .gift-section {
        margin-bottom: var(--spacing-3xl);
    }

    .gift-section h2 {
        font-size: var(--font-size-3xl);
        text-align: center;
        color: var(--color-gray-800);
        margin-bottom: var(--spacing-md);
    }

    .section-description {
        text-align: center;
        color: var(--color-gray-600);
        font-size: var(--font-size-lg);
        margin-bottom: var(--spacing-xl);
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
    }

    .gift-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--grid-gap);
        margin-bottom: var(--spacing-3xl);
    }

    /* Filter controls styles */
    .filter-controls {
        display: flex;
        justify-content: center;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-2xl);
    }

    .filter-button {
        background-color: var(--color-gray-200);
        color: var(--color-gray-700);
        border: none;
        border-radius: var(--radius-full);
        padding: var(--spacing-sm) var(--spacing-lg);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: all 0.2s ease;
        margin-bottom: var(--spacing-l);
    }

    .filter-button:hover {
        background-color: var(--color-gray-300);
    }

    .filter-button.active {
        background-color: var(--color-primary);
        color: white;
    }

    @media (max-width: 768px) {

        .gift-section h2 {
            font-size: var(--font-size-2xl);
        }

        .gift-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: var(--spacing-md);
        }


        .filter-controls {
            flex-wrap: wrap;
        }
    }
</style>