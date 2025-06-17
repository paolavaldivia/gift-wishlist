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
                    <h3>Purchase Links</h3>
                    <button type="button" class="add-link-btn" onclick={addPurchaseLink}>
                        Add Link
                    </button>
                    
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
                            >
                                ✕
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
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        position: relative;
    }
    
    .admin-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }
    
    .header-actions {
        display: flex;
        gap: 1rem;
    }
    
    .new-gift-btn {
        background-color: var(--color-primary, #3b82f6);
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        font-weight: 500;
    }
    
    .notification {
        padding: 1rem;
        border-radius: 0.375rem;
        margin-bottom: 1.5rem;
    }
    
    .notification-success {
        background-color: var(--color-success-light, #d1fae5);
        color: var(--color-success, #047857);
    }
    
    .notification-error {
        background-color: var(--color-error-light, #fee2e2);
        color: var(--color-error, #b91c1c);
    }
    
    .gifts-table-container {
        overflow-x: auto;
    }
    
    .empty-state {
        text-align: center;
        padding: 3rem;
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .empty-state p {
        margin-bottom: 1.5rem;
        color: var(--color-gray-500, #6b7280);
    }
    
    .gifts-table {
        width: 100%;
        border-collapse: collapse;
        background-color: white;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .gifts-table th, .gifts-table td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
        vertical-align: middle;
    }
    
    .gifts-table th {
        background-color: var(--color-gray-100, #f3f4f6);
        font-weight: 600;
    }

    .image-cell {
        width: 80px;
    }
    
    .gift-thumbnail {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 0.25rem;
    }
    
    .status-available {
        color: var(--color-success, #047857);
        font-weight: 500;
    }
    
    .status-taken {
        color: var(--color-gray-600, #4b5563);
        font-style: italic;
    }
    
    .edit-btn, .delete-btn, .unreserve-btn {
        padding: 0.375rem 0.75rem;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 0.875rem;
    }
    
    .edit-btn {
        background-color: var(--color-primary-light, #dbeafe);
        color: var(--color-primary, #3b82f6);
    }
    
    .delete-btn {
        background-color: var(--color-error-light, #fee2e2);
        color: var(--color-error, #b91c1c);
    }
    
    .unreserve-btn {
        background-color: var(--color-warning-light, #fef3c7);
        color: var(--color-warning-dark, #92400e);
    }
    
    .edit-form-container {
        background-color: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
    }
    
    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .form-group {
        margin-bottom: 1rem;
    }
    
    .full-width {
        grid-column: 1 / -1;
    }
    
    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }
    
    input, select, textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--color-gray-300, #d1d5db);
        border-radius: 0.375rem;
        font-size: 1rem;
    }
    
    .image-preview {
        margin-top: 0.5rem;
        max-width: 200px;
    }
    
    .image-preview img {
        width: 100%;
        border-radius: 0.25rem;
        border: 1px solid var(--color-gray-200, #e5e7eb);
    }
    
    .purchase-links-section {
        margin-bottom: 2rem;
    }
    
    .purchase-links-section h3 {
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .add-link-btn {
        background-color: var(--color-gray-100, #f3f4f6);
        color: var(--color-gray-800, #1f2937);
        padding: 0.375rem 0.75rem;
        border: 1px solid var(--color-gray-300, #d1d5db);
        border-radius: 0.375rem;
        cursor: pointer;
        font-size: 0.875rem;
    }
    
    .purchase-link-row {
        display: grid;
        grid-template-columns: 1fr 2fr auto;
        gap: 1rem;
        align-items: end;
        margin-bottom: 1rem;
    }
    
    .remove-link-btn {
        background-color: var(--color-error-light, #fee2e2);
        color: var(--color-error, #b91c1c);
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }
    
    .cancel-btn {
        background-color: var(--color-gray-200, #e5e7eb);
        color: var(--color-gray-800, #1f2937);
        padding: 0.375rem 0.75rem;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
    }
    
    .save-btn {
        background-color: var(--color-primary, #3b82f6);
        color: white;
        padding: 0.375rem 0.75rem;
        border: none;
        border-radius: 0.375rem;
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
        background-color: white;
        padding: 2rem;
        border-radius: 0.5rem;
        max-width: 500px;
        width: 90%;
    }
    
    .confirmation-dialog h3 {
        margin-top: 0;
        margin-bottom: 1rem;
    }
    
    .confirmation-dialog p {
        margin-bottom: 1.5rem;
    }
    
    .confirmation-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }
</style>