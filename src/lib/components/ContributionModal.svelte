<script lang="ts">
	import type { BigGift } from '$lib/types/gift';
	import Modal from '$lib/components/Modal.svelte';
	import PaymentOptionsModal from './PaymentOptionsModal.svelte';

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
			amount: number;
			name: string;
			email?: string;
			message?: string;
			hideContributorName?: boolean;
		}>) => void;
	} = $props();

	// Form state
	let amount = $state<string>('');
	let name = $state('');
	let email = $state('');
	let message = $state('');
	let hideContributorName = $state(false);

	// UI state
	let isSubmitting = $state(false);
	let isSuccess = $state(false);
	let showPaymentOptions = $state(false);
	let formErrors = $state<Record<string, string>>({});

	// Form inputs refs
	let amountInput: HTMLInputElement | null = $state(null);
	let nameInput: HTMLInputElement | null = $state(null);

	// Predefined contribution amounts
	const suggestedAmounts = [10, 25, 50, 100, 200];

	// Focus management
	$effect(() => {
		if (isOpen && amountInput && !isSuccess) {
			setTimeout(() => amountInput?.focus(), 100);
		}
	});

	function handleClose() {
		if (isSubmitting) return;

		// Reset form
		amount = '';
		name = '';
		email = '';
		message = '';
		hideContributorName = false;
		isSuccess = false;
		formErrors = {};
		showPaymentOptions = false;

		close();
	}

	function selectSuggestedAmount(suggestedAmount: number) {
		amount = suggestedAmount.toString();
		formErrors.amount = '';
	}

	function validateForm(): boolean {
		const errors: Record<string, string> = {};

		// Validate amount
		const numAmount = parseFloat(amount);
		if (!amount.trim()) {
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
					amount: parseFloat(amount),
					name: name.trim(),
					email: email.trim() || undefined,
					message: message.trim() || undefined,
					hideContributorName
				}
			}));

			// Show success state
			isSuccess = true;
		} catch (error) {
			console.error('Contribution error:', error);
			formErrors.submit = 'Failed to process contribution. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	function togglePaymentOptions() {
		showPaymentOptions = !showPaymentOptions;
	}

	function closePaymentOptions() {
		showPaymentOptions = false;
	}

	function formatPrice(price: number, currency: string): string {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: currency
		}).format(price);
	}

	function getRemainingAmount(): number {
		if (!bigGift) return 0;
		return Math.max(bigGift.targetAmount - bigGift.currentAmount, 0);
	}

	function getProgressPercentage(): number {
		if (!bigGift || bigGift.targetAmount === 0) return 0;
		return Math.min((bigGift.currentAmount / bigGift.targetAmount) * 100, 100);
	}
</script>

<Modal
	show={isOpen && bigGift !== null}
	title={isSuccess ? 'Thank You!' : `Contribute to ${bigGift?.name || ''}`}
	onClose={handleClose}
	size="lg"
>
	{#if bigGift}
		{#if isSuccess}
			<!-- Success View -->
			<div class="success-message">
				<div class="success-icon">🎉</div>
				<h3 class="success-title">Contribution Successful!</h3>
				<p class="success-description">
					Thank you for contributing {formatPrice(parseFloat(amount), bigGift.currency)}
					to {bigGift.name}. Every contribution brings us closer to making this gift possible!
				</p>

				<div class="success-actions">
					<button class="btn btn-primary" onclick={togglePaymentOptions}>
						<span class="btn-icon">💳</span>
						Complete Payment
					</button>
					<button class="btn btn-secondary" onclick={handleClose}>
						Close
					</button>
				</div>

				<div class="payment-note">
					<p>Please complete your payment using the payment options above.</p>
				</div>
			</div>
		{:else}
			<!-- Contribution Form -->
			<div class="contribution-form-container">
				<!-- Gift Preview -->
				<div class="gift-preview">
					<div class="gift-image">
						<img src={bigGift.imagePath} alt={bigGift.name} />
					</div>
					<div class="gift-details">
						<h3 class="gift-name">{bigGift.name}</h3>
						<div class="gift-progress">
							<div class="progress-amounts">
								<span class="current">{formatPrice(bigGift.currentAmount, bigGift.currency)}</span>
								<span class="separator">of</span>
								<span class="target">{formatPrice(bigGift.targetAmount, bigGift.currency)}</span>
							</div>
							<div class="progress-bar-small">
								<div class="progress-fill" style:width="{getProgressPercentage()}%"></div>
							</div>
							<div class="remaining">
								{formatPrice(getRemainingAmount(), bigGift.currency)} remaining
							</div>
						</div>
					</div>
				</div>

				<!-- Contribution Form -->
				<form class="contribution-form" onsubmit={handleSubmit}>
					{#if formErrors.submit}
						<div class="error-banner" role="alert" aria-live="polite">
							{formErrors.submit}
						</div>
					{/if}

					<!-- Amount Selection -->
					<div class="form-section">
						<label class="form-label" for="contributionAmount">
							Contribution Amount <span class="required">*</span>
						</label>

						<!-- Suggested Amounts -->
						<div class="suggested-amounts">
							{#each suggestedAmounts as suggestedAmount}
								<button
									type="button"
									class="amount-btn"
									class:selected={amount === suggestedAmount.toString()}
									onclick={() => selectSuggestedAmount(suggestedAmount)}
								>
									{formatPrice(suggestedAmount, bigGift.currency)}
								</button>
							{/each}
						</div>

						<!-- Custom Amount Input -->
						<div class="amount-input-group" class:error={formErrors.amount}>
							<span class="currency-symbol">€</span>
							<input
								id="contributionAmount"
								bind:this={amountInput}
								bind:value={amount}
								type="number"
								min="1"
								max="10000"
								step="0.01"
								class="form-input amount-input"
								placeholder="Enter custom amount"
								disabled={isSubmitting}
								aria-describedby={formErrors.amount ? 'amount-error' : undefined}
								oninput={() => { if (formErrors.amount) formErrors.amount = ''; }}
							/>
						</div>

						{#if formErrors.amount}
							<div id="amount-error" class="error-message" role="alert">
								{formErrors.amount}
							</div>
						{/if}
					</div>

					<!-- Contributor Information -->
					<div class="form-section">
						<label class="form-label" for="contributorName">
							Your Name <span class="required">*</span>
						</label>
						<input
							id="contributorName"
							bind:this={nameInput}
							bind:value={name}
							type="text"
							class="form-input"
							class:error={formErrors.name}
							placeholder="Enter your name"
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

					<!-- Email (Optional) -->
					<div class="form-section">
						<label class="form-label" for="contributorEmail">
							Email (optional)
						</label>
						<input
							id="contributorEmail"
							bind:value={email}
							type="email"
							class="form-input"
							class:error={formErrors.email}
							placeholder="your.email@example.com"
							disabled={isSubmitting}
							autocomplete="email"
							aria-describedby={formErrors.email ? 'email-error' : undefined}
							oninput={() => { if (formErrors.email) formErrors.email = ''; }}
						/>
						{#if formErrors.email}
							<div id="email-error" class="error-message" role="alert">
								{formErrors.email}
							</div>
						{/if}
					</div>

					<!-- Message (Optional) -->
					<div class="form-section">
						<label class="form-label" for="contributorMessage">
							Message (optional)
						</label>
						<textarea
							id="contributorMessage"
							bind:value={message}
							class="form-textarea"
							placeholder="Leave a message with your contribution..."
							rows="3"
							maxlength="500"
							disabled={isSubmitting}
						></textarea>
						<div class="character-count">
							{message.length}/500 characters
						</div>
					</div>

					<!-- Privacy Options -->
					<div class="form-section">
						<label class="checkbox-label">
							<input
								type="checkbox"
								bind:checked={hideContributorName}
								disabled={isSubmitting}
								class="checkbox-input"
							/>
							<span class="checkbox-text">Keep my contribution anonymous</span>
						</label>
						<p class="privacy-note">
							If checked, your name will be hidden from the public contributors list.
						</p>
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
			</div>
		{/if}
	{/if}

	<PaymentOptionsModal show={showPaymentOptions} onClose={closePaymentOptions} />
</Modal>

<style>
    .success-message {
        text-align: center;
        padding: var(--spacing-xl);
    }

    .success-icon {
        font-size: 4rem;
        margin-bottom: var(--spacing-lg);
    }

    .success-title {
        margin: 0 0 var(--spacing-md) 0;
        font-size: var(--font-size-2xl);
        color: var(--color-success);
        font-weight: var(--font-weight-bold);
    }

    .success-description {
        margin: 0 0 var(--spacing-xl) 0;
        color: var(--color-gray-600);
        line-height: var(--line-height-normal);
        font-size: var(--font-size-lg);
    }

    .success-actions {
        display: flex;
        gap: var(--spacing-md);
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: var(--spacing-lg);
    }

    .payment-note {
        padding: var(--spacing-md);
        background: var(--color-info-light);
        border: 1px solid var(--color-info);
        border-radius: var(--radius-md);
        color: var(--color-info-dark);
        font-size: var(--font-size-sm);
    }

    .contribution-form-container {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xl);
    }

    .gift-preview {
        display: flex;
        gap: var(--spacing-lg);
        padding: var(--spacing-lg);
        background: var(--color-gray-50);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-gray-200);
    }

    .gift-image {
        flex-shrink: 0;
        width: 120px;
        height: 120px;
        border-radius: var(--radius-lg);
        overflow: hidden;
        background: var(--color-white);
    }

    .gift-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .gift-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }

    .gift-name {
        margin: 0;
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-gray-800);
        line-height: var(--line-height-tight);
    }

    .gift-progress {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .progress-amounts {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--font-size-lg);
    }

    .current {
        font-weight: var(--font-weight-bold);
        color: var(--color-success);
    }

    .separator {
        color: var(--color-gray-500);
    }

    .target {
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
    }

    .progress-bar-small {
        width: 100%;
        height: 8px;
        background: var(--color-gray-200);
        border-radius: var(--radius-full);
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-success) 100%);
        transition: width 0.3s ease;
    }

    .remaining {
        font-size: var(--font-size-sm);
        color: var(--color-gray-600);
        font-style: italic;
    }

    .contribution-form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }

    .error-banner {
        padding: var(--spacing-md);
        background: var(--color-danger-light);
        border: 1px solid var(--color-danger);
        border-radius: var(--radius-md);
        color: var(--color-danger-dark);
        font-size: var(--font-size-sm);
        text-align: center;
    }

    .form-section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .form-label {
        font-weight: var(--font-weight-semibold);
        color: var(--color-gray-700);
        font-size: var(--font-size-sm);
    }

    .required {
        color: var(--color-danger);
    }

    .suggested-amounts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: var(--spacing-sm);
    }

    .amount-btn {
        padding: var(--spacing-sm) var(--spacing-md);
        border: 2px solid var(--color-gray-200);
        background: var(--color-white);
        color: var(--color-gray-700);
        border-radius: var(--radius-md);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: var(--font-size-sm);
    }

    .amount-btn:hover {
        border-color: var(--color-primary);
        background: var(--color-primary-light);
    }

    .amount-btn.selected {
        border-color: var(--color-primary);
        background: var(--color-primary);
        color: white;
    }

    .amount-input-group {
        position: relative;
        display: flex;
        align-items: center;
    }

    .currency-symbol {
        position: absolute;
        left: var(--spacing-md);
        color: var(--color-gray-500);
        font-weight: var(--font-weight-medium);
        z-index: 1;
    }

    .amount-input {
        padding-left: calc(var(--spacing-md) + 1.5ch);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-medium);
    }

    .form-input {
        padding: var(--spacing-md);
        border: 2px solid var(--color-gray-200);
        border-radius: var(--radius-md);
        font-size: var(--font-size-base);
        transition: border-color 0.2s ease;
        background: var(--color-white);
    }

    .form-input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
    }

    .form-input.error {
        border-color: var(--color-danger);
    }

    .form-textarea {
        padding: var(--spacing-md);
        border: 2px solid var(--color-gray-200);
        border-radius: var(--radius-md);
        font-size: var(--font-size-base);
        font-family: inherit;
        resize: vertical;
        min-height: 80px;
        transition: border-color 0.2s ease;
        background: var(--color-white);
    }

    .form-textarea:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
    }

    .character-count {
        font-size: var(--font-size-xs);
        color: var(--color-gray-500);
        text-align: right;
    }

    .checkbox-label {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-sm);
        cursor: pointer;
        font-size: var(--font-size-sm);
    }

    .checkbox-input {
        margin-top: 2px;
        flex-shrink: 0;
    }

    .checkbox-text {
        color: var(--color-gray-700);
        font-weight: var(--font-weight-medium);
    }

    .privacy-note {
        margin: var(--spacing-xs) 0 0 0;
        font-size: var(--font-size-xs);
        color: var(--color-gray-500);
        line-height: var(--line-height-normal);
    }

    .error-message {
        color: var(--color-danger);
        font-size: var(--font-size-xs);
        margin-top: var(--spacing-xs);
    }

    .form-actions {
        display: flex;
        gap: var(--spacing-md);
        justify-content: flex-end;
        padding-top: var(--spacing-lg);
        border-top: 1px solid var(--color-gray-100);
    }

    .btn {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-md) var(--spacing-lg);
        border: none;
        border-radius: var(--radius-md);
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        white-space: nowrap;
    }

    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .btn-primary {
        background: var(--color-primary);
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        background: var(--color-primary-dark);
        transform: translateY(-1px);
    }

    .btn-secondary {
        background: var(--color-gray-100);
        color: var(--color-gray-700);
        border: 1px solid var(--color-gray-200);
    }

    .btn-secondary:hover:not(:disabled) {
        background: var(--color-gray-200);
    }

    .btn-icon {
        font-size: var(--font-size-lg);
    }

    .spinner {
        width: 16px;
        height: 16px;
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

    /* Responsive Design */
    @media (max-width: 768px) {
        .gift-preview {
            flex-direction: column;
            text-align: center;
        }

        .gift-image {
            align-self: center;
        }

        .suggested-amounts {
            grid-template-columns: repeat(2, 1fr);
        }

        .form-actions {
            flex-direction: column;
        }

        .success-actions {
            flex-direction: column;
        }
    }

    /* Accessibility */
    @media (prefers-reduced-motion: reduce) {
        .amount-btn,
        .form-input,
        .form-textarea,
        .btn,
        .progress-fill {
            transition: none;
        }

        .btn-primary:hover:not(:disabled) {
            transform: none;
        }

        .spinner {
            animation: none;
        }
    }

    /* Focus styles for keyboard navigation */
    .amount-btn:focus-visible,
    .form-input:focus-visible,
    .form-textarea:focus-visible,
    .checkbox-input:focus-visible,
    .btn:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }
</style>