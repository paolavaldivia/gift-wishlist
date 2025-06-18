<script lang="ts">
	import { enhance } from '$app/forms';
	import { fly } from 'svelte/transition';
	import type { Gift } from '$lib/types/gift';

	let { data } = $props();
	let gifts = $state<Gift[]>(data.gifts);

	// Form state
	let isEditing = $state(false);
	let currentGift = $state<Partial<Gift>>({
		name: '',
		description: '',
		imagePath: '',
		approximatePrice: 0,
		currency: 'EUR',
		purchaseLinks: [{ siteName: '', url: '' }]
	});

	// Notification state
	let notification = $state<{ show: boolean; message: string; type: 'success' | 'error' }>({
		show: false,
		message: '',
		type: 'success'
	});

	// Confirmation dialog state
	let showConfirmation = $state(false);
	let confirmationAction = $state<{ id: string; type: 'delete' | 'unreserve' } | null>(null);

	function showNotification(message: string, type: 'success' | 'error') {
		notification = { show: true, message, type };
		setTimeout(() => {
			notification.show = false;
		}, 3000);
	}

	function editGift(gift: Gift) {
		currentGift = { ...gift };
		isEditing = true;
	}

	function createNewGift() {
		currentGift = {
			name: '',
			description: '',
			imagePath: '',
			approximatePrice: 0,
			currency: 'EUR',
			purchaseLinks: [{ siteName: '', url: '' }]
		};
		isEditing = true;
	}

	function addPurchaseLink() {
		currentGift.purchaseLinks = [...(currentGift.purchaseLinks || []), { siteName: '', url: '' }];
	}

	function removePurchaseLink(index: number) {
		currentGift.purchaseLinks = currentGift.purchaseLinks?.filter((_, i) => i !== index) || [];
	}

	function cancelEdit() {
		isEditing = false;
	}

	function confirmDelete(id: string) {
		confirmationAction = { id, type: 'delete' };
		showConfirmation = true;
	}

	function confirmUnreserve(id: string) {
		confirmationAction = { id, type: 'unreserve' };
		showConfirmation = true;
	}

	function cancelConfirmation() {
		showConfirmation = false;
		confirmationAction = null;
	}

	function formatPrice(price: number, currency: string) {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: currency
		}).format(price);
	}
</script>

<div class="admin-container">
	<header class="admin-header">
		<h1>Gift Management</h1>
		<div class="header-actions">
			<button class="new-gift-btn" onclick={createNewGift}>Add New Gift</button>
		</div>
	</header>

	{#if notification.show}
		<div
			class="notification {notification.type === 'success' ? 'notification-success' : 'notification-error'}"
			transition:fly={{ y: -20, duration: 300 }}
		>
			{notification.message}
		</div>
	{/if}

	{#if isEditing}
		<div class="edit-form-container" transition:fly={{ y: 20, duration: 300 }}>
			<h2>{currentGift.id ? 'Edit Gift' : 'Create New Gift'}</h2>

			<form
				method="POST"
				action={currentGift.id ? '?/updateGift' : '?/createGift'}
				use:enhance={() => {
                    return ({ result }) => {
                        if (result.type === 'success') {
                            isEditing = false;
                            gifts = result.data?.gifts || [];
                            showNotification(
                                currentGift.id ? 'Gift updated successfully' : 'Gift created successfully',
                                'success'
                            );
                        } else if (result.type === 'failure') {
                            showNotification(typeof result.data?.message === 'string' ? result.data.message : 'An error occurred', 'error');
                        }
                    };
                }}
			>
				{#if currentGift.id}
					<input type="hidden" name="id" value={currentGift.id} />
				{/if}

				<div class="form-grid">
					<div class="form-group">
						<label for="name">Gift Name</label>
						<input
							type="text"
							id="name"
							name="name"
							bind:value={currentGift.name}
							required
						/>
					</div>

					<div class="form-group">
						<label for="imagePath">Image URL</label>
						<input
							type="url"
							id="imagePath"
							name="imagePath"
							bind:value={currentGift.imagePath}
							required
						/>
						{#if currentGift.imagePath}
							<div class="image-preview">
								<img src={currentGift.imagePath} alt="Gift Preview" />
							</div>
						{/if}
					</div>

					<div class="form-group">
						<label for="approximatePrice">Price</label>
						<input
							type="number"
							id="approximatePrice"
							name="approximatePrice"
							bind:value={currentGift.approximatePrice}
							min="0"
							step="0.01"
							required
						/>
					</div>

					<div class="form-group">
						<label for="currency">Currency</label>
						<select id="currency" name="currency" bind:value={currentGift.currency} required>
							<option value="EUR">EUR</option>
							<option value="USD">USD</option>
							<option value="GBP">GBP</option>
						</select>
					</div>

					<div class="form-group full-width">
						<label for="description">Description</label>
						<textarea
							id="description"
							name="description"
							bind:value={currentGift.description}
							rows="4"
							required
						></textarea>
					</div>
				</div>

				<div class="purchase-links-section">
					<div class="section-header">
						<h3>Purchase Links</h3>
						<button type="button" class="add-link-btn" onclick={addPurchaseLink}>
							Add Link
						</button>
					</div>
					
					{#each currentGift.purchaseLinks || [] as link, index (index)}
						<div class="purchase-link-row">
							<div class="form-group">
								<label for={`siteName-${index}`}>Site Name</label>
								<input 
									type="text" 
									id={`siteName-${index}`} 
									name={`purchaseLinks[${index}].siteName`} 
									bind:value={link.siteName} 
									required
								/>
							</div>
							
							<div class="form-group">
								<label for={`url-${index}`}>URL</label>
								<input 
									type="url" 
									id={`url-${index}`} 
									name={`purchaseLinks[${index}].url`} 
									bind:value={link.url} 
									required
								/>
							</div>
							
							<button 
								type="button" 
								class="remove-link-btn" 
								onclick={() => removePurchaseLink(index)}
								aria-label="Remove link"
							>
								×
							</button>
						</div>
					{/each}
				</div>

				<div class="form-actions">
					<button type="button" class="cancel-btn" onclick={cancelEdit}>Cancel</button>
					<button type="submit" class="save-btn">
						{currentGift.id ? 'Update Gift' : 'Create Gift'}
					</button>
				</div>
			</form>
		</div>
	{:else}
		<div class="gifts-table-container">
			{#if gifts.length === 0}
				<div class="empty-state">
					<p>No gifts found. Add your first gift to get started!</p>
					<button class="new-gift-btn" onclick={createNewGift}>Add New Gift</button>
				</div>
			{:else}
				<table class="gifts-table">
					<thead>
					<tr>
						<th>Image</th>
						<th>Name</th>
						<th>Price</th>
						<th>Status</th>
						<th>Actions</th>
					</tr>
					</thead>
					<tbody>
					{#each gifts as gift (gift.id)}
						<tr class={gift.isTaken ? 'gift-taken' : ''}>
							<td class="image-cell">
								<img src={gift.imagePath} alt={gift.name} class="gift-thumbnail" />
							</td>
							<td>{gift.name}</td>
							<td>{formatPrice(gift.approximatePrice, gift.currency)}</td>
							<td>
								{#if gift.isTaken}
									<span class="status-taken">Reserved by {gift.hideReserverName ? '[Hidden]' : gift.takenBy}</span>
								{:else}
									<span class="status-available">Available</span>
								{/if}
							</td>
							<td class="actions-cell">
								<button class="edit-btn" onclick={() => editGift(gift)}>Edit</button>
								
								<button class="delete-btn" onclick={() => confirmDelete(gift.id)}>Delete</button>
								
								{#if gift.isTaken}
									<button class="unreserve-btn" onclick={() => confirmUnreserve(gift.id)}>
										Unreserve
									</button>
								{/if}
							</td>
						</tr>
					{/each}
					</tbody>
				</table>
			{/if}
		</div>
	{/if}

	<!-- Confirmation Dialog -->
	{#if showConfirmation}
		<div class="confirmation-overlay" transition:fly={{ duration: 200 }}>
			<div class="confirmation-dialog">
				<h3>Confirm {confirmationAction?.type === 'delete' ? 'Deletion' : 'Unreserve'}</h3>
				<p>
					{#if confirmationAction?.type === 'delete'}
						Are you sure you want to delete this gift? This action cannot be undone.
					{:else}
						Are you sure you want to unreserve this gift? The person who reserved it will no longer have it reserved.
					{/if}
				</p>
				<div class="confirmation-actions">
					<button class="cancel-btn" onclick={cancelConfirmation}>Cancel</button>

					<form
						method="POST"
						action={confirmationAction?.type === 'delete' ? '?/deleteGift' : '?/unreserveGift'}
						use:enhance={() => {
                            return ({ result }) => {
                                if (result.type === 'success') {
                                    showConfirmation = false;
                                    gifts = result.data.gifts;
                                    showNotification(
                                        confirmationAction?.type === 'delete' 
                                            ? 'Gift deleted successfully' 
                                            : 'Gift unreserved successfully',
                                        'success'
                                    );
                                } else if (result.type === 'failure') {
                                    showNotification(typeof result.data?.message  === 'string' ? result.data.message : 'An error occurred', 'error');
                                }
                                confirmationAction = null;
                            };
                        }}
					>
						<input type="hidden" name="id" value={confirmationAction?.id || ''} />
						<button type="submit" class={confirmationAction?.type === 'delete' ? 'delete-btn' : 'unreserve-btn'}>
							{confirmationAction?.type === 'delete' ? 'Delete' : 'Unreserve'}
						</button>
					</form>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
    .admin-container {
        max-width: var(--container-max-width);
        margin: 0 auto;
        padding: var(--spacing-xl);
        position: relative;
    }

    .admin-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-xl);
    }

    .header-actions {
        display: flex;
        gap: var(--spacing-md);
    }

    .new-gift-btn {
        background-color: var(--color-primary);
        color: var(--color-white);
        padding: var(--spacing-sm) var(--spacing-md);
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-weight: var(--font-weight-medium);
    }

    .notification {
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-lg);
    }

    .notification-success {
        background-color: var(--color-success-light);
        color: var(--color-success);
    }

    .notification-error {
        background-color: var(--color-error-light);
        color: var(--color-error);
    }

    .gifts-table-container {
        overflow-x: auto;
    }

    .empty-state {
        text-align: center;
        padding: var(--spacing-3xl);
        background-color: var(--color-white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
    }

    .empty-state p {
        margin-bottom: var(--spacing-lg);
        color: var(--color-gray-500);
    }

    .gifts-table {
        width: 100%;
        border-collapse: collapse;
        background-color: var(--color-white);
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
    }

    .gifts-table th, .gifts-table td {
        padding: var(--spacing-md);
        text-align: left;
        border-bottom: 1px solid var(--color-gray-200);
        vertical-align: middle;
    }

    .gifts-table th {
        background-color: var(--color-gray-100);
        font-weight: var(--font-weight-semibold);
    }

    .image-cell {
        width: 80px;
    }

    .gift-thumbnail {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: var(--radius-sm);
    }

    .status-available {
        color: var(--color-success);
        font-weight: var(--font-weight-medium);
    }

    .status-taken {
        color: var(--color-gray-600);
        font-style: italic;
    }

    button {
        height: var(--button-height);
    }

    .edit-btn, .delete-btn, .unreserve-btn {
        padding: var(--spacing-xs) var(--spacing-sm);
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-size: var(--font-size-sm);
    }

    .edit-btn {
        background-color: var(--color-primary-light);
        color: var(--color-primary);
    }

    .delete-btn {
        background-color: var(--color-danger-light);
        color: var(--color-gray-800);
    }

    .unreserve-btn {
        background-color: var(--color-warning-light);
				color: var(--color-gray-800);
    }

    .edit-form-container {
        background-color: var(--color-white);
        padding: var(--spacing-xl);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        margin-bottom: var(--spacing-xl);
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
    }

    .form-group {
        margin-bottom: var(--spacing-md);
    }

    .full-width {
        grid-column: 1 / -1;
    }

    label {
        display: block;
        margin-bottom: var(--spacing-sm);
        font-weight: var(--font-weight-medium);
    }

    input, select, textarea {
        width: 100%;
        padding: var(--spacing-sm);
        border: 1px solid var(--color-gray-300);
        border-radius: var(--radius-md);
        font-size: var(--font-size-base);
    }

    .image-preview {
        margin-top: var(--spacing-sm);
        max-width: 200px;
    }

    .image-preview img {
        width: 100%;
        border-radius: var(--radius-sm);
        border: 1px solid var(--color-gray-200);
    }

    .purchase-links-section {
        margin-bottom: var(--spacing-xl);
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-md);
    }

    .section-header h3 {
        margin-bottom: var(--spacing-md);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .add-link-btn {
        background-color: var(--color-gray-100);
        color: var(--color-gray-800);
        padding: var(--spacing-xs) var(--spacing-sm);
        border: 1px solid var(--color-gray-300);
        border-radius: var(--radius-md);
        cursor: pointer;
        font-size: var(--font-size-sm);
        margin-left: var(--spacing-md);
    }

    .purchase-link-row {
        display: grid;
        grid-template-columns: 1fr 2fr auto;
        gap: var(--spacing-md);
        align-items: center;
        margin-bottom: var(--spacing-md);
        border: 1px solid var(--color-gray-200);
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        background-color: var(--color-gray-50);
    }

    .remove-link-btn {
        background-color: var(--color-danger-light);
        color: var(--color-danger-dark);
        width: 32px;
        height: 32px;
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-lg);
        line-height: 1;
        justify-self: end;
        align-self: flex-start;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-md);
    }

    .cancel-btn {
        background-color: var(--color-gray-200);
        color: var(--color-gray-800);
        padding: var(--spacing-xs) var(--spacing-sm);
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
    }

    .save-btn {
        background-color: var(--color-primary);
        color: var(--color-white);
        padding: var(--spacing-xs) var(--spacing-sm);
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
    }

    /* Confirmation Dialog */
    .confirmation-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .confirmation-dialog {
        background-color: var(--color-white);
        padding: var(--spacing-xl);
        border-radius: var(--radius-lg);
        max-width: 500px;
        width: 90%;
    }

    .confirmation-dialog h3 {
        margin-top: 0;
        margin-bottom: var(--spacing-md);
    }

    .confirmation-dialog p {
        margin-bottom: var(--spacing-lg);
    }

    .confirmation-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-md);
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .form-grid {
            grid-template-columns: 1fr;
        }

        .purchase-link-row {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto;
            gap: var(--spacing-sm);
        }

        .purchase-link-row .form-group {
            margin-bottom: 0;
            width: 100%;
        }

        .form-actions {
            flex-direction: column-reverse;
            gap: var(--spacing-sm);
        }

        .form-actions button {
            width: 100%;
        }

        .gifts-table th:nth-child(4),
        .gifts-table td:nth-child(4) {
            display: none;
        }

        .actions-cell {
            flex-direction: column;
            gap: var(--spacing-xs);
        }

        .actions-cell button {
            width: 100%;
        }
    }
</style>
