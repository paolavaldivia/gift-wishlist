<script lang="ts">
	import type { Gift } from '$lib/types/gift';
	import * as m from '$lib/paraglide/messages';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let {
		gift,
		isOpen = false,
		close,
		reserve
	}: {
		gift: Gift | null;
		isOpen: boolean;
		close: () => void;
		reserve: (event: CustomEvent<{ giftId: string; name: string }>) => void;
	} = $props();


	let name = $state('');
	let isSubmitting = $state(false);
	let isSuccess = $state(false);
	let nameInput: HTMLInputElement|null = $state(null);

	// Focus input when modal opens
	$effect(() => {
		if (isOpen && nameInput && !isSuccess) {
			setTimeout(() => nameInput?.focus(), 100);
		}
	});

	function handleClose() {
		if (isSubmitting) return;
		name = '';
		isSuccess = false;
		close();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		
		if (!gift || !name.trim() || isSubmitting) return;

		isSubmitting = true;

		try {
			// Dispatch the reserve event with the gift ID and name
			reserve(new CustomEvent('reserve', { 
				detail: { 
					giftId: gift.id, 
					name 
				} 
			}));
			
			// Show success state
			isSuccess = true;
		} finally {
			isSubmitting = false;
		}
	}

	function formatPrice(price: number, currency: string) {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: currency
		}).format(price);
	}
</script>

{#if isOpen && gift}
	<div
		class="modal-backdrop"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-labelledby="modal-title"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="modal-content"
			transition:fly={{
				y: 50,
				duration: 300,
				easing: quintOut
			}}
		>
			<!-- Modal Header -->
			<header class="modal-header">
				<h2 id="modal-title">{isSuccess ? m['giftList.thankYou']({ name }) : m['giftList.reserve']()}</h2>
				<button
					class="close-button"
					onclick={handleClose}
					disabled={isSubmitting}
					aria-label="Close modal"
				>
					×
				</button>
			</header>

			{#if isSuccess}
				<!-- Success View -->
				<div class="success-message">
					<div class="gift-image success-image">
						<img src={gift.imagePath} alt={gift.name} />
					</div>
					<p class="thank-you-message">{m['giftList.babyThanks']({ name })}</p>
					<button class="btn btn-primary close-btn" onclick={handleClose}>
						{m['giftList.close']()}
					</button>
				</div>
			{:else}
				<!-- Gift Information -->
				<div class="gift-preview">
					<div class="gift-image">
						<img src={gift.imagePath} alt={gift.name} />
					</div>
					<div class="gift-details">
						<h3>{gift.name}</h3>
						<p class="gift-description">{gift.description}</p>
						<div class="gift-price">
							{formatPrice(gift.approximatePrice, gift.currency)}
						</div>
					</div>
				</div>

				<!-- Reservation Form -->
				<form class="reservation-form" onsubmit={handleSubmit}>
					<div class="form-group">
						<label for="reservationName" class="form-label">
							{m['giftList.name']()}
						</label>
						<input
							id="reservationName"
							bind:this={nameInput}
							bind:value={name}
							type="text"
							class="form-input"
							placeholder={m['giftList.namePlaceholder']()}
							required
							disabled={isSubmitting}
							autocomplete="name"
						/>
					</div>

					<div class="form-actions">
						<button
							type="button"
							class="btn btn-secondary"
							onclick={handleClose}
							disabled={isSubmitting}
						>
							{m['giftList.cancel']()}
						</button>
						<button
							type="submit"
							class="btn btn-primary"
							disabled={!name.trim() || isSubmitting}
						>
							{#if isSubmitting}
								<span class="spinner"></span>
								{m['giftList.reserving']()}
							{:else}
								{m['giftList.reserve']()}
							{/if}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: var(--z-modal);
        padding: var(--spacing-lg);
    }

    .modal-content {
        background: var(--color-white);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-xl);
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
        border-bottom: 1px solid var(--color-gray-200);
    }

    .modal-header h2 {
        margin: 0;
        font-size: var(--font-size-2xl);
        color: var(--color-gray-800);
    }

    .close-button {
        background: none;
        border: none;
        font-size: 2rem;
        color: var(--color-gray-500);
        cursor: pointer;
        padding: 0;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
    }

    .close-button:hover:not(:disabled) {
        background: var(--color-gray-100);
        color: var(--color-gray-700);
    }

    .close-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .gift-preview {
        display: flex;
        gap: var(--spacing-lg);
        padding: var(--spacing-lg) var(--spacing-xl);
        border-bottom: 1px solid var(--color-gray-100);
    }

    .gift-image {
        flex-shrink: 0;
        width: 100px;
        height: 100px;
        border-radius: var(--radius-lg);
        overflow: hidden;
        background: var(--color-gray-50);
    }

    .gift-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .gift-details {
        flex: 1;
        min-width: 0;
    }

    .gift-details h3 {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--font-size-lg);
        color: var(--color-gray-800);
        line-height: var(--line-height-tight);
    }

    .gift-description {
        margin: 0 0 var(--spacing-sm) 0;
        color: var(--color-gray-600);
        font-size: var(--font-size-sm);
        line-height: var(--line-height-normal);
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .gift-price {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--color-success);
    }

    .reservation-form {
        padding: var(--spacing-xl);
    }

    .form-group {
        margin-bottom: var(--spacing-lg);
    }

    .form-label {
        display: block;
        margin-bottom: var(--spacing-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-gray-700);
        font-size: var(--font-size-sm);
    }

    .form-input {
        width: 100%;
        padding: var(--spacing-md);
        border: 2px solid var(--color-gray-200);
        border-radius: var(--radius-md);
        font-size: var(--font-size-base);
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        background: var(--color-white);
    }

    .form-input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(143, 192, 169, 0.2);
    }

    .form-input:disabled {
        background: var(--color-gray-50);
        cursor: not-allowed;
    }

    .form-actions {
        display: flex;
        gap: var(--spacing-md);
        justify-content: flex-end;
    }

    .form-actions .btn {
        min-width: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
    }

    .spinner {
        width: 1rem;
        height: 1rem;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .success-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--spacing-xl);
        text-align: center;
    }
    
    .success-image {
        margin-bottom: var(--spacing-lg);
    }
    
    .thank-you-message {
        font-size: var(--font-size-xl);
        color: var(--color-success);
        margin-bottom: var(--spacing-xl);
    }
    
    .close-btn {
        min-width: 120px;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .modal-backdrop {
            padding: var(--spacing-md);
        }

        .modal-content {
            max-height: 95vh;
        }

        .gift-preview {
            flex-direction: column;
            gap: var(--spacing-md);
        }

        .gift-image {
            width: 80px;
            height: 80px;
            align-self: center;
        }

        .form-actions {
            flex-direction: column-reverse;
        }

        .form-actions .btn {
            width: 100%;
        }
    }
</style>