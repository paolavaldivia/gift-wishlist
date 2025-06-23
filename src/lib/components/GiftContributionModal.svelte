<script lang="ts">
	import type { BigGift } from '$lib/types/gift';
	import Modal from '$lib/components/Modal.svelte';
	import { formatPrice } from '$lib/util/format';
	import * as m from '$lib/paraglide/messages';
	import GoalProgress from '$lib/components/GoalProgress.svelte';
	import PaymentOptions from '$lib/components/payment-options/PaymentOptions.svelte';

	let {
		bigGift,
		isOpen = false,
		close,
		contribute
	}: {
		bigGift: BigGift | null;
		isOpen: boolean;
		close: () => void;
		contribute: (event: CustomEvent<{
			bigGiftId: string;
			amount: number;
			name: string;
			email?: string;
			message?: string;
			hideContributorName?: boolean;
		}>) => void;
	} = $props();

	let amount = $state('');
	let name = $state('');
	let email = $state('');
	let message = $state('');
	let hideContributorName = $state(false);
	let isSubmitting = $state(false);
	let isSuccess = $state(false);
	let formErrors = $state<Record<string, string>>({});
	let amountInput: HTMLInputElement | null = $state(null);
	let nameInput: HTMLInputElement | null = $state(null);

	// Focus management
	$effect(() => {
		if (isOpen && amountInput && !isSuccess) {
			setTimeout(() => amountInput?.focus(), 100);
		}
	});

	function handleClose() {
		if (isSubmitting) return;
		amount = '';
		name = '';
		email = '';
		message = '';
		hideContributorName = false;
		isSuccess = false;
		formErrors = {};
		close();
	}

	function validateForm(): boolean {
		const errors: Record<string, string> = {};

		// Validate amount
		const numAmount = parseFloat(amount);
		if (!amount) {
			errors.amount = 'Contribution amount is required';
		} else if (isNaN(numAmount) || numAmount <= 0) {
			errors.amount = 'Please enter a valid amount';
		} else if (numAmount < 1) {
			errors.amount = 'Minimum contribution is €1';
		} else if (numAmount > 10000) {
			errors.amount = 'Maximum contribution is €10,000';
		}

		// Validate name
		if (!name.trim()) {
			errors.name = 'Name is required';
		} else if (name.trim().length < 2) {
			errors.name = 'Name must be at least 2 characters';
		}

		// Validate email (optional but must be valid if provided)
		if (email.trim() && !isValidEmail(email.trim())) {
			errors.email = 'Please enter a valid email address';
		}

		formErrors = errors;
		return Object.keys(errors).length === 0;
	}

	function isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	function handleSubmit(event: Event) {
		event.preventDefault();

		if (!bigGift || isSubmitting) return;

		if (!validateForm()) {
			// Focus first error field
			const firstErrorField = Object.keys(formErrors)[0];
			if (firstErrorField === 'amount' && amountInput) {
				amountInput.focus();
			} else if (firstErrorField === 'name' && nameInput) {
				nameInput.focus();
			}
			return;
		}

		isSubmitting = true;

		try {
			// Dispatch contribution event
			contribute(new CustomEvent('contribute', {
				detail: {
					bigGiftId: bigGift.id,
					amount: parseFloat(amount),
					name: name.trim(),
					email: email.trim() || undefined,
					message: message.trim() || undefined,
					hideContributorName
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
	show={isOpen && bigGift !== null}
	title={isSuccess ? m['giftList.thankYou']({ name }) : m['giftList.contributionModal.title']({ name: bigGift?.name || '' })}
	onClose={handleClose}
	maxWidth="600px"
>
	{#if bigGift}
		{#if isSuccess}
			<!-- Success View -->
			<div class="success-message">
				<p>{m['giftList.contributionModal.babyPaymentThanks']()}</p>

				<div class="success-content">
					<!-- Gift image (left column) -->
					<div class="gift-image success-image">
						<img src={bigGift.imagePath} alt={bigGift.name} />
					</div>

					<!-- Success message (right column) -->
					<div class="success-details">
						{m['giftList.contributionModal.thankYouDetails']({ price: formatPrice(parseFloat(amount), bigGift.currency), name: bigGift.name })}
					</div>
				</div>
				<div class="payment-note">
				<PaymentOptions/>
					</div>
				<button class="btn btn-primary close-btn" onclick={handleClose}>
					{m['giftList.close']()}
				</button>
			</div>
		{:else}
			<!-- Gift Information -->
			<div class="gift-preview">
				<div class="gift-image">
					<img src={bigGift.imagePath} alt={bigGift.name} />
				</div>
				<div class="gift-details">
					<h3 class="gift-name">{bigGift.name}</h3>
					<div class="gift-progress-section">
						<GoalProgress
							currentAmount={bigGift.currentAmount}
							targetAmount={bigGift.targetAmount}
							currency={bigGift.currency}
						/>
					</div>
				</div>
			</div>

			<!-- Contribution Form -->
			<form class="contribution-form" onsubmit={handleSubmit}>
				<div class="form-group">
					<label for="contributionAmount" class="form-label">
						{m['giftList.contributionModal.amount']()}
					</label>
					<div class="amount-input-group">
						<input
							id="contributionAmount"
							bind:this={amountInput}
							bind:value={amount}
							type="number"
							min="1"
							max="10000"
							step="1"
							class="form-input amount-input"
							placeholder={m['giftList.contributionModal.amountPlaceholder']()}
							disabled={isSubmitting}
							aria-describedby={formErrors.amount ? 'amount-error' : undefined}
							oninput={() => { if (formErrors.amount) formErrors.amount = ''; }}
						/>
						{#if formErrors.amount}
							<div id="amount-error" class="error-message" role="alert">
								{formErrors.amount}
							</div>
						{/if}
					</div>
				</div>

				<!-- Contributor Information -->
				<div class="form-group">
					<label for="contributorName" class="form-label">
						{m['giftList.contributionModal.name']()}
					</label>
					<input
						id="contributorName"
						bind:this={nameInput}
						bind:value={name}
						type="text"
						class="form-input"
						class:error={formErrors.name}
						placeholder={m['giftList.contributionModal.namePlaceholder']()}
						required
						disabled={isSubmitting}
						autocomplete="name"
						aria-describedby={formErrors.name ? 'name-error' : undefined}
						oninput={() => { if (formErrors.name) formErrors.name = ''; }}
					/>
					{#if formErrors.name}
						<div id="name-error" class="error-message" role="alert">
							{formErrors.name}
						</div>
					{/if}
				</div>

				<!-- Privacy checkbox -->
				<div class="form-group checkbox-group">
					<label class="checkbox-label">
						<input
							type="checkbox"
							bind:checked={hideContributorName}
							disabled={isSubmitting}
							class="checkbox-input"
						/>
						<span class="checkbox-text">{m['giftList.hideMyName']()}</span>
					</label>
					<p class="privacy-note">{m['giftList.privacyNote']()}</p>
				</div>

				<!-- Form Actions -->
				<div class="form-actions">
					<button
						type="button"
						class="btn btn-secondary"
						onclick={handleClose}
						disabled={isSubmitting}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="btn btn-primary"
						disabled={!amount || !name.trim() || isSubmitting}
					>
						{#if isSubmitting}
							<span class="spinner"></span>
							Processing...
						{:else}
							<span class="btn-icon">💝</span>
							Contribute {amount ? formatPrice(parseFloat(amount) || 0, bigGift.currency) : ''}
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

    .gift-progress-section {
        margin-top: auto;
    }

    .contribution-form {
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


    .payment-note {
				width: auto;
        padding: var(--spacing-md);
				border-top: 1px solid var(--color-gray-100);
				margin: var(--spacing-lg) 0;
    }

    .close-btn {
        min-width: 120px;
        margin-top: var(--spacing-lg);
    }

    .success-price {
        margin-bottom: var(--spacing-md);
    }

</style>
