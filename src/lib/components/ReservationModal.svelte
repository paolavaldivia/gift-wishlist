<script lang="ts">
	import type { Gift } from '$lib/types/gift';
	import * as m from '$lib/paraglide/messages';
	import Modal from '$lib/components/Modal.svelte';
	import { formatPrice } from '$lib/util/format';

	let {
		gift,
		isOpen = false,
		close,
		reserve
	}: {
		gift: Gift | null;
		isOpen: boolean;
		close: () => void;
		reserve: (event: CustomEvent<{ giftId: string; name: string; hideReserverName: boolean }>) => void;
	} = $props();


	let name = $state('');
	let hideReserverName = $state(false); // Privacy state
	let isSubmitting = $state(false);
	let isSuccess = $state(false);
	let nameInput: HTMLInputElement | null = $state(null);

	// Focus input when modal opens
	$effect(() => {
		if (isOpen && nameInput && !isSuccess) {
			setTimeout(() => nameInput?.focus(), 100);
		}
	});

	function handleClose() {
		if (isSubmitting) return;
		name = '';
		hideReserverName = false; // Reset privacy state
		isSuccess = false;
		close();
	}

	function handleSubmit(event: Event) {
		event.preventDefault();

		if (!gift || !name.trim() || isSubmitting) return;

		isSubmitting = true;

		try {
			// Dispatch the reserve event with the gift ID, name, and privacy preference
			reserve(new CustomEvent('reserve', {
				detail: {
					giftId: gift.id,
					name,
					hideReserverName // Include privacy preference
				}
			}));

			// Show success state
			isSuccess = true;
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Modal
	show={isOpen && gift !== null}
	title={isSuccess ? m['giftList.thankYou']({ name }) : m['giftList.reserve']()}
	onClose={handleClose}
>
	{#if gift}
		{#if isSuccess}
			<!-- Success View -->
			<div class="success-message">
				<p>{m['giftList.babyThanks']()}</p>

				<div class="success-content">
					<!-- Gift image (left column) -->
					<div class="gift-image success-image">
						<img src={gift.imagePath} alt={gift.name} />
					</div>
					<!-- Price and purchase links (right column) -->
					<div class="success-details">
						<div class="gift-price success-price">
							{formatPrice(gift.approximatePrice, gift.currency)}
						</div>

						{#if gift.purchaseLinks && gift.purchaseLinks.length > 0}
							<div class="purchase-links">
								<span class="label">{m['giftList.buyAt']()}: </span>
								<div class="links">
									{#each gift.purchaseLinks as link (link.url)}
										<a href={link.url} target="_blank" rel="noopener noreferrer" class="purchase-link">
											{link.siteName}
										</a>
									{/each}
								</div>
							</div>
						{/if}
					</div>


				</div>

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

				<!-- Privacy checkbox -->
				<div class="form-group checkbox-group">
					<label class="checkbox-label">
						<input
							type="checkbox"
							bind:checked={hideReserverName}
							disabled={isSubmitting}
							class="checkbox-input"
						/>
						<span class="checkbox-text">{m['giftList.hideMyName']()}</span>
					</label>
					<p class="privacy-note">{m['giftList.privacyNote']()}</p>
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
	{/if}
</Modal>

<style>
    .gift-preview {
        display: flex;
        gap: var(--spacing-lg);
        padding-bottom: var(--spacing-lg);
        border-bottom: 1px solid var(--color-gray-100);
        margin-bottom: var(--spacing-lg);
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
        line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .gift-price {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--color-success);
    }

    .reservation-form {
        display: grid;
        gap: var(--spacing-lg);
    }

    .form-group {
        margin: 0;
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

    /* Privacy checkbox styles */
    .checkbox-group {
        margin: 0;
    }

    .checkbox-label {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-sm);
        cursor: pointer;
        font-size: var(--font-size-sm);
        color: var(--color-gray-700);
    }

    .checkbox-input {
        margin: 0;
        width: 1.2rem;
        height: 1.2rem;
        flex-shrink: 0;
        cursor: pointer;
        accent-color: var(--color-primary);
    }

    .checkbox-text {
        line-height: 1.3;
    }

    .privacy-note {
        margin: var(--spacing-xs) 0 0 1.7rem;
        font-size: var(--font-size-xs);
        color: var(--color-gray-500);
        font-style: italic;
        line-height: var(--line-height-normal);
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
        text-align: center;
    }

    .success-content {
        display: flex;
        width: 100%;
        gap: var(--spacing-lg);
        margin: var(--spacing-lg) 0;
        align-items: center;
    }

    .success-details {
        flex: 1;
        text-align: left;
    }

    .success-image {
        width: 120px;
        height: 120px;
        margin: 0;
    }

    .close-btn {
        min-width: 120px;
        margin-top: var(--spacing-lg);
    }

    .success-price {
        margin-bottom: var(--spacing-md);
    }

    .purchase-links {
        margin-top: var(--spacing-md);
    }

    .purchase-links .label {
        color: var(--color-gray-500);
        font-weight: var(--font-weight-medium);
        display: block;
        margin-bottom: var(--spacing-xs);
    }

    .links {
        display: flex;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
    }

    .purchase-link {
        color: var(--color-primary);
        text-decoration: none;
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

    /* Mobile responsiveness */
    @media (max-width: 768px) {
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

        /* Mobile responsiveness for success view */
        .success-content {
            flex-direction: column-reverse;
        }
        
        .success-details {
            text-align: center;
            width: 100%;
        }
        
        .success-image {
            margin-bottom: var(--spacing-md);
        }
    }
</style>