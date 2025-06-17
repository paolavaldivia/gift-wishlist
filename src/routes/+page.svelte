<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { fly } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import GiftCard from '$lib/components/GiftCard.svelte';
	import DonationSection from '$lib/components/DonationSection.svelte';
	import HeroHeader from '$lib/components/HeroHeader.svelte';
	import ReservationModal from '$lib/components/ReservationModal.svelte';
	import type { Gift } from '$lib/types/gift';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let gifts = $state<Gift[]>(data.gifts as Gift[]);
	
	// Filter state
	let filterMode = $state<'all' | 'available'>('all');
	let filteredGifts = $derived(
		filterMode === 'all' 
			? gifts 
			: gifts.filter(gift => !gift.isTaken)
	);

	// Modal state
	let isModalOpen = $state(false);
	let selectedGift = $state<Gift | null>(null);

	// Error notification state
	let errorNotification = $state<{ show: boolean; message: string }>({
		show: false,
		message: ''
	});

	// Simple flag to prevent reprocessing the same form result
	let isProcessingForm = $state(false);

	// Update gifts when form action completes
	$effect(() => {
		if (form && 'success' in form && !isProcessingForm) {
			isProcessingForm = true;

			if (form.success && form.gift) {
				// Update gifts array with the new data
				gifts = gifts.map(g =>
					g.id === form.gift.id ? form.gift : g
				);
			} else if (!form.success) {
				showErrorNotification(new Error(form.message || 'Unknown error'));
				isModalOpen = false;
				selectedGift = null;
				isProcessingForm = false;
			}
		}
	});

	function handleReserveClick(giftId: string) {
		const gift = gifts.find(g => g.id === giftId);
		if (gift && !gift.isTaken) {
			selectedGift = gift;
			isModalOpen = true;
		}
	}

	function handleModalClose() {
		isModalOpen = false;
		selectedGift = null;
	}

	// Updated to handle privacy preference
	function handleReserve(event: CustomEvent<{ giftId: string; name: string; hideReserverName: boolean }>) {
		const { giftId, name, hideReserverName } = event.detail;

		// Set form values
		const giftIdInput = document.getElementById('hiddenGiftId') as HTMLInputElement;
		const nameInput = document.getElementById('hiddenName') as HTMLInputElement;
		const hideNameInput = document.getElementById('hiddenHideReserverName') as HTMLInputElement;
		const form = document.getElementById('hiddenReservationForm') as HTMLFormElement;

		if (giftIdInput && nameInput && hideNameInput && form) {
			giftIdInput.value = giftId;
			nameInput.value = name;
			hideNameInput.value = hideReserverName.toString();
			form.requestSubmit();
		}
	}

	function showErrorNotification(error: unknown) {
		let message = m['errors.giftList.reservationFailed']();

		if (error instanceof Error) {
			if (error.message.includes('404')) {
				message = m['errors.giftList.giftNotFound']();
			} else if (error.message.includes('400') || error.message.includes('already')) {
				message = m['errors.giftList.alreadyTaken']();
			}
		}

		errorNotification = { show: true, message };
		setTimeout(() => {
			errorNotification = { show: false, message: '' };
		}, 5000);
	}

	function handleFilterChange(newMode: 'all' | 'available') {
		filterMode = newMode;
	}
</script>

<!-- Error Notification -->
{#if errorNotification.show}
	<div class="notification notification-error" transition:fly={{ y: -50, duration: 300 }}>
		<div class="notification-content">
			<span class="notification-icon">❌</span>
			<span class="notification-text">
				{errorNotification.message}
			</span>
		</div>
	</div>
{/if}

<!-- Hidden form for SvelteKit action -->
<form
	id="hiddenReservationForm"
	method="POST"
	action="?/reserveGift"
	use:enhance={() => {
		return ({ update }) => {
			update({ reset: false });
		};
	}}
	style="display: none;"
>
	<input id="hiddenGiftId" type="hidden" name="giftId" value="" />
	<input id="hiddenName" type="hidden" name="name" value="" />
	<input id="hiddenHideReserverName" type="hidden" name="hideReserverName" value="" />
</form>

<HeroHeader />

<div class="container">
	<section class="gift-section">
		<h2>{m['giftList.title']()}</h2>
		<p class="section-description">{m['giftList.description']()}</p>
		
		<!-- Filter controls -->
		<div class="filter-controls">
			<button 
				class="filter-button" 
				class:active={filterMode === 'all'} 
				onclick={() => handleFilterChange('all')}
			>
				{m['giftList.showAll']()}
			</button>
			<button 
				class="filter-button" 
				class:active={filterMode === 'available'} 
				onclick={() => handleFilterChange('available')}
			>
				{m['giftList.showAvailable']()}
			</button>
		</div>

		<div class="gift-grid">
			{#each filteredGifts as gift (gift.id)}
				<GiftCard
					{gift}
					onReserve={handleReserveClick}
				/>
			{/each}
		</div>
	</section>

	<DonationSection />
</div>

<!-- Reservation Modal -->
<ReservationModal
	gift={selectedGift}
	isOpen={isModalOpen}
	close={handleModalClose}
	reserve={handleReserve}
/>

<style>
    .container {
        max-width: var(--container-max-width);
        margin: 0 auto;
        padding-inline: var(--spacing-xl);
    }

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

    /* Notification Styles */
    .notification {
        position: fixed;
        top: var(--spacing-lg);
        right: var(--spacing-lg);
        z-index: var(--z-toast);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        max-width: 400px;
        overflow: hidden;
    }

    .notification-error {
        background: var(--color-danger);
        color: var(--color-white);
    }

    .notification-content {
        padding: var(--spacing-lg);
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }

    .notification-icon {
        font-size: var(--font-size-lg);
        flex-shrink: 0;
    }

    .notification-text {
        font-weight: var(--font-weight-medium);
        line-height: var(--line-height-normal);
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
        .container {
            padding-inline: var(--spacing-md);
        }

        .gift-section h2 {
            font-size: var(--font-size-2xl);
        }

        .gift-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: var(--spacing-md);
        }

        .notification {
            top: var(--spacing-md);
            right: var(--spacing-md);
            left: var(--spacing-md);
            max-width: none;
        }

        .filter-controls {
            flex-wrap: wrap;
        }
    }
</style>