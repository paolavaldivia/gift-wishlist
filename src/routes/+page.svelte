<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { fly } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import GiftCard from '$lib/components/GiftCard.svelte';
	import DonationSection from '$lib/components/DonationSection.svelte';
	import WaveClipPath from '$lib/components/WaveClipPath.svelte';
	import ReservationModal from '$lib/components/ReservationModal.svelte';
	import type { Gift } from '$lib/types/gift';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let gifts = $state<Gift[]>(data.gifts as Gift[]);

	// Modal state
	let isModalOpen = $state(false);
	let selectedGift = $state<Gift | null>(null);

	// Success notification state
	let successNotification = $state<{ show: boolean; name: string }>({
		show: false,
		name: ''
	});

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
				console.log('Form success, updating gift:', form.gift);

				// Update gifts array with the new data
				gifts = gifts.map(g =>
					g.id === form.gift.id ? form.gift : g
				);

				// Handle UI updates asynchronously
				setTimeout(() => {
					if (form.name) {
						showSuccessNotification(form.name);
					}
					isModalOpen = false;
					selectedGift = null;
					isProcessingForm = false;
				}, 0);
			} else if (!form.success) {
				setTimeout(() => {
					showErrorNotification(new Error(form.message || 'Unknown error'));
					isProcessingForm = false;
				}, 0);
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

	function handleReserve(event: CustomEvent<{ giftId: string; name: string }>) {
		const { giftId, name } = event.detail;

		// Set form values
		const giftIdInput = document.getElementById('hiddenGiftId') as HTMLInputElement;
		const nameInput = document.getElementById('hiddenName') as HTMLInputElement;
		const form = document.getElementById('hiddenReservationForm') as HTMLFormElement;

		if (giftIdInput && nameInput && form) {
			giftIdInput.value = giftId;
			nameInput.value = name;
			form.requestSubmit();
		}
	}

	function showSuccessNotification(name: string) {
		successNotification = { show: true, name };
		setTimeout(() => {
			successNotification = { show: false, name: '' };
		}, 4000);
	}

	function showErrorNotification(error: unknown) {
		let message = 'Erreur lors de la réservation / Error during reservation / Error durante la reserva';

		if (error instanceof Error) {
			if (error.message.includes('404')) {
				message = 'Ce cadeau n\'existe plus / This gift no longer exists / Este regalo ya no existe';
			} else if (error.message.includes('400') || error.message.includes('already')) {
				message = 'Ce cadeau a déjà été réservé / This gift is already taken / Este regalo ya está reservado';
			}
		}

		errorNotification = { show: true, message };
		setTimeout(() => {
			errorNotification = { show: false, message: '' };
		}, 5000);
	}

	function handleDonate() {
		alert('La fonction de donation sera bientôt disponible! / Donation feature coming soon! / ¡Función de donación próximamente!');
	}
</script>

<!-- Success Notification -->
{#if successNotification.show}
	<div class="notification notification-success" transition:fly={{ y: -50, duration: 300 }}>
		<div class="notification-content">
			<span class="notification-icon">✅</span>
			<span class="notification-text">
				{m['giftList.thankYou']({ name: successNotification.name })}
			</span>
		</div>
	</div>
{/if}

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
</form>

<WaveClipPath />
<header class="hero-container">
	<div class="hero wave-top">
		<div class="hero-content-container">
			<div class="hero-content">
				<h1>{m.heading()}</h1>
				<p class="subtitle">{m.subheading()}</p>
			</div>
		</div>

		<div class="pride-squares">
			<div class="pride-square" style="background-color: var(--color-pride-red)"></div>
			<div class="pride-square" style="background-color: var(--color-pride-orange)"></div>
			<div class="pride-square" style="background-color: var(--color-pride-yellow)"></div>
			<div class="pride-square" style="background-color: var(--color-pride-green)"></div>
			<div class="pride-square" style="background-color: var(--color-pride-blue)"></div>
			<div class="pride-square" style="background-color: var(--color-pride-purple)"></div>
			<div class="pride-square" style="background-color: var(--color-pride-pink)"></div>
		</div>

		<!-- Placeholder for the belly photo -->
		<div class="hero-image">
			<img src="https://picsum.photos/600/400?random=2"  alt="Céline's Belly"/>
		</div>
	</div>
</header>

<div class="container">
	<section class="gift-section">
		<h2>{m['giftList.title']()}</h2>
		<p class="section-description">{m['giftList.description']()}</p>

		<div class="gift-grid">
			{#each gifts as gift (gift.id)}
				<GiftCard
					{gift}
					onReserve={handleReserveClick}
				/>
			{/each}
		</div>
	</section>

	<DonationSection
		onDonate={handleDonate}
	/>
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
        padding: var(--spacing-xl);
    }

    .hero-container {
        filter: drop-shadow(var(--shadow-sm));
    }

    .hero {
        margin-bottom: var(--spacing-3xl);
        padding: var(--spacing-2xl);
        background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-gray-300) 100%);
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-2xl);
        align-items: center;
        position: relative;
        overflow: hidden;
        box-shadow: var(--shadow-lg);
    }

    .hero::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: inherit;
        z-index: -1;
    }

    @keyframes wobble {
        0%, 100% {
            d: path('M0,40 C80,30 100,50 200,40 C300,30 400,50 500,40 L500,0 L0,0 Z');
        }
        50% {
            d: path('M0,40 C120,50 200,30 300,50 C400,30 450,50 500,40 L500,0 L0,0 Z');
        }
    }

    .hero-content-container {
        width: 100%;
        padding-left: var(--spacing-lg);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .hero-content {
        max-width: 400px;
    }

    .hero h1 {
        font-size: var(--font-size-4xl);
        color: var(--color-gray-800);
        margin-bottom: var(--spacing-md);
        font-weight: var(--font-weight-bold);
        line-height: var(--line-height-tight);
        text-align: center;
    }

    .subtitle {
        font-size: var(--font-size-lg);
        color: var(--color-gray-600);
        margin: 0;
        line-height: var(--line-height-relaxed);
    }

    .hero-image {
        max-width: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: var(--spacing-xs);
    }

    .hero-image img {
        width: 100%;
        height: auto;
        object-fit: cover;
        border-radius: var(--radius-lg);
        position: relative;
        z-index: 1;
    }

    .hero-image::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg,
        var(--color-pride-red),
        var(--color-pride-orange),
        var(--color-pride-yellow),
        var(--color-pride-green),
        var(--color-pride-blue),
        var(--color-pride-purple),
        var(--color-pride-pink)
        );
        border-radius: calc(var(--radius-lg) + 5px);
        z-index: 0;
        filter: blur(2px);
        opacity: 0.6;
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
        margin-bottom: var(--spacing-2xl);
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

    .pride-squares {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        gap: var(--spacing-sm);
        display: flex;
        flex-direction: column;
        z-index: 1;
    }

    .pride-square {
        width: 20px;
        height: 20px;
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-sm);
        animation: var(--transition-slow) tilt;
    }

    @keyframes tilt {
        0% {
            transform: rotate(0deg);
        }
        50% {
            transform: scale(1.2) rotate(10deg);
        }
        100% {
            transform: scale(1) rotate(0deg);
        }
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

    .notification-success {
        background: var(--color-success);
        color: var(--color-white);
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

    @media (max-width: 768px) {
        .container {
            padding: var(--spacing-md);
        }

        .hero {
            padding: var(--spacing-lg) var(--spacing-md) var(--spacing-2xl);
            grid-template-columns: 1fr;
            text-align: center;
            display: flex;
            flex-direction: column;
        }

        .hero-content {
            max-width: 80%;
            text-align: center;
            padding-left: 0;
            order: 1;
        }

        .hero h1 {
            font-size: var(--font-size-3xl);
        }

        .subtitle {
            font-size: var(--font-size-base);
        }

        .hero-image {
            max-width: min(300px, 80%);
            min-height: 200px;
            margin-top: var(--spacing-lg);
            margin-bottom: var(--spacing-md);
            height: auto;
            order: 3;
        }

        .hero-image::before {
            filter: blur(5px);
        }

        .gift-section h2 {
            font-size: var(--font-size-2xl);
        }

        .gift-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: var(--spacing-md);
        }

        .pride-squares {
            position: static;
            flex-direction: row;
            transform: none;
            justify-content: center;
            margin: var(--spacing-md) 0;
            padding: 0;
            z-index: 1;
            order: 2;
        }

        .pride-square {
            width: 20px;
            height: 20px;
        }

        .notification {
            top: var(--spacing-md);
            right: var(--spacing-md);
            left: var(--spacing-md);
            max-width: none;
        }
    }
</style>