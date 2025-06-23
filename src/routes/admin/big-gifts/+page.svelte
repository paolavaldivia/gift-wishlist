<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Reactive state for big gifts list
	let bigGifts = $state(data.bigGifts);
	let stats = $state(data.stats);

	// Form state
	let isEditing = $state(false);
	let currentBigGift = $state({
		id: '',
		name: '',
		description: '',
		imagePath: '',
		targetAmount: 0,
		currency: 'EUR' as const,
		purchaseLinks: [] as Array<{ siteName: string; url: string }>
	});

	// Update reactive state when data changes
	$effect(() => {
		bigGifts = data.bigGifts;
		stats = data.stats;
	});

	// Handle form responses
	$effect(() => {
		if (form?.success) {
			// Reset form and close editor
			resetForm();
			isEditing = false;
			// Invalidate to refresh data
			invalidateAll();
		}
	});

	function resetForm() {
		currentBigGift = {
			id: '',
			name: '',
			description: '',
			imagePath: '',
			targetAmount: 0,
			currency: 'EUR',
			purchaseLinks: []
		};
	}

	function createNewBigGift() {
		resetForm();
		isEditing = true;
	}

	function editBigGift(bigGift: typeof bigGifts[0]) {
		currentBigGift = {
			id: bigGift.id,
			name: bigGift.name,
			description: bigGift.description,
			imagePath: bigGift.imagePath,
			targetAmount: bigGift.targetAmount,
			currency: bigGift.currency as 'EUR' | 'USD' | 'PEN',
			purchaseLinks: [...bigGift.purchaseLinks]
		};
		isEditing = true;
	}

	function cancelEdit() {
		resetForm();
		isEditing = false;
	}

	function addPurchaseLink() {
		currentBigGift.purchaseLinks = [...currentBigGift.purchaseLinks, { siteName: '', url: '' }];
	}

	function removePurchaseLink(index: number) {
		currentBigGift.purchaseLinks = currentBigGift.purchaseLinks.filter((_, i) => i !== index);
	}

	function formatCurrency(amount: number, currency: string): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency,
			minimumFractionDigits: 2
		}).format(amount);
	}

	function getProgressPercentage(current: number, target: number): number {
		if (target === 0) return 0;
		return Math.min((current / target) * 100, 100);
	}

	function getStatusClass(current: number, target: number): string {
		const percentage = getProgressPercentage(current, target);
		if (percentage >= 100) return 'fully-funded';
		if (percentage > 0) return 'partially-funded';
		return 'not-funded';
	}
</script>

<svelte:head>
	<title>Big Gifts Admin - Gift Registry</title>
</svelte:head>

<div class="big-gifts-admin">
	<div class="admin-header">
		<div class="header-content">
			<h1>Big Gifts Management</h1>
			<p>Manage community-funded big gifts with contribution tracking</p>
		</div>
		{#if !isEditing}
			<button class="new-big-gift-btn" onclick={createNewBigGift}>
				<span class="icon">+</span>
				Add New Big Gift
			</button>
		{/if}
	</div>

	{#if form?.message}
		<div class="message {form.success ? 'success' : 'error'}" role="alert">
			{form.message}
		</div>
	{/if}

	<div class="stats-grid">
		<div class="stat-card">
			<h3>Total Big Gifts</h3>
			<span class="stat-number">{stats.total}</span>
		</div>
		<div class="stat-card">
			<h3>Fully Funded</h3>
			<span class="stat-number fully-funded">{stats.fullyFunded}</span>
		</div>
		<div class="stat-card">
			<h3>Partially Funded</h3>
			<span class="stat-number partially-funded">{stats.partiallyFunded}</span>
		</div>
		<div class="stat-card">
			<h3>Not Funded</h3>
			<span class="stat-number not-funded">{stats.notFunded}</span>
		</div>
		<div class="stat-card">
			<h3>Total Target</h3>
			<span class="stat-number">{formatCurrency(stats.totalTargetAmount, 'EUR')}</span>
		</div>
		<div class="stat-card">
			<h3>Total Raised</h3>
			<span class="stat-number">{formatCurrency(stats.totalCurrentAmount, 'EUR')}</span>
		</div>
	</div>

	{#if isEditing}
		<div class="edit-section">
			<div class="edit-header">
				<h2>{currentBigGift.id ? 'Edit Big Gift' : 'Create New Big Gift'}</h2>
			</div>

			<form
				method="post"
				action={currentBigGift.id ? '?/updateBigGift' : '?/createBigGift'}
				use:enhance
				class="big-gift-form"
			>
				{#if currentBigGift.id}
					<input type="hidden" name="id" value={currentBigGift.id} />
				{/if}

				<div class="form-grid">
					<div class="form-group">
						<label for="name">Name</label>
						<input
							type="text"
							id="name"
							name="name"
							bind:value={currentBigGift.name}
							required
							maxlength="200"
						/>
					</div>

					<div class="form-group">
						<label for="imagePath">Image Path</label>
						<input
							type="text"
							id="imagePath"
							name="imagePath"
							bind:value={currentBigGift.imagePath}
							required
							placeholder="/images/big-gift.jpg"
						/>
					</div>

					<div class="form-group">
						<label for="targetAmount">Target Amount</label>
						<input
							type="number"
							id="targetAmount"
							name="targetAmount"
							bind:value={currentBigGift.targetAmount}
							min="0"
							step="0.01"
							required
						/>
					</div>

					<div class="form-group">
						<label for="currency">Currency</label>
						<select id="currency" name="currency" bind:value={currentBigGift.currency} required>
							<option value="EUR">EUR</option>
							<option value="USD">USD</option>
							<option value="PEN">PEN</option>
						</select>
					</div>

					<div class="form-group full-width">
						<label for="description">Description</label>
						<textarea
							id="description"
							name="description"
							bind:value={currentBigGift.description}
							rows="4"
							required
							maxlength="1000"
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

					{#each currentBigGift.purchaseLinks || [] as link, index (index)}
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
						{currentBigGift.id ? 'Update Big Gift' : 'Create Big Gift'}
					</button>
				</div>
			</form>
		</div>
	{:else}
		<div class="big-gifts-table-container">
			{#if bigGifts.length === 0}
				<div class="empty-state">
					<p>No big gifts found. Add your first big gift to get started!</p>
					<button class="new-big-gift-btn" onclick={createNewBigGift}>Add New Big Gift</button>
				</div>
			{:else}
				<table class="big-gifts-table">
					<thead>
					<tr>
						<th>Image</th>
						<th>Name</th>
						<th>Target</th>
						<th>Progress</th>
						<th>Contributors</th>
						<th>Actions</th>
					</tr>
					</thead>
					<tbody>
					{#each bigGifts as bigGift (bigGift.id)}
						<tr class={getStatusClass(bigGift.currentAmount, bigGift.targetAmount)}>
							<td class="image-cell">
								<img src={bigGift.imagePath} alt={bigGift.name} loading="lazy" />
							</td>
							<td class="name-cell">
								<div class="gift-name">{bigGift.name}</div>
								<div class="gift-description">{bigGift.description}</div>
							</td>
							<td class="target-cell">
								{formatCurrency(bigGift.targetAmount, bigGift.currency)}
							</td>
							<td class="progress-cell">
								<div class="progress-info">
									<div class="progress-amounts">
										<span class="current">{formatCurrency(bigGift.currentAmount, bigGift.currency)}</span>
										<span class="percentage">({getProgressPercentage(bigGift.currentAmount, bigGift.targetAmount).toFixed(1)}%)</span>
									</div>
									<div class="progress-bar">
										<div
											class="progress-fill"
											style="width: {getProgressPercentage(bigGift.currentAmount, bigGift.targetAmount)}%"
										></div>
									</div>
								</div>
							</td>
							<td class="contributors-cell">
								<span class="contributor-count">{bigGift.contributors.length}</span>
								{#if bigGift.contributors.length > 0}
									<div class="contributor-list">
										{#each bigGift.contributors.slice(0, 3) as contributor}
												<span class="contributor-name">
													{contributor.hideContributorName ? 'Anonymous' : contributor.name}
												</span>
										{/each}
										{#if bigGift.contributors.length > 3}
											<span class="more-contributors">+{bigGift.contributors.length - 3} more</span>
										{/if}
									</div>
								{/if}
							</td>
							<td class="actions-cell">
								<button
									class="edit-btn"
									onclick={() => editBigGift(bigGift)}
									aria-label="Edit {bigGift.name}"
								>
									Edit
								</button>
								{#if bigGift.contributors.length === 0}
									<form method="post" action="?/deleteBigGift" use:enhance style="display: inline;">
										<input type="hidden" name="id" value={bigGift.id} />
										<button
											type="submit"
											class="delete-btn"
											onclick={() => confirmDelete(bigGift.id)}
											aria-label="Delete {bigGift.name}"
										>
											Delete
										</button>
									</form>
								{:else}
										<span class="delete-disabled" title="Cannot delete big gift with contributions">
											Delete
										</span>
								{/if}
							</td>
						</tr>
					{/each}
					</tbody>
				</table>
			{/if}
		</div>
	{/if}
</div>

<style>
    .big-gifts-admin {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
    }

    .admin-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2rem;
        gap: 2rem;
    }

    .header-content h1 {
        margin: 0 0 0.5rem 0;
        color: #1f2937;
        font-size: 2rem;
        font-weight: 600;
    }

    .header-content p {
        margin: 0;
        color: #6b7280;
        font-size: 1rem;
    }

    .new-big-gift-btn {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: background-color 0.2s;
    }

    .new-big-gift-btn:hover {
        background: #2563eb;
    }

    .new-big-gift-btn .icon {
        font-size: 1.2rem;
        font-weight: bold;
    }

    .message {
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1.5rem;
        font-weight: 500;
    }

    .message.success {
        background: #d1fae5;
        color: #065f46;
        border: 1px solid #a7f3d0;
    }

    .message.error {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #fca5a5;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
        text-align: center;
    }

    .stat-card h3 {
        margin: 0 0 0.5rem 0;
        font-size: 0.875rem;
        color: #6b7280;
        text-transform: uppercase;
        font-weight: 500;
        letter-spacing: 0.05em;
    }

    .stat-number {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2937;
    }

    .stat-number.fully-funded {
        color: #059669;
    }

    .stat-number.partially-funded {
        color: #d97706;
    }

    .stat-number.not-funded {
        color: #dc2626;
    }

    .edit-section {
        background: white;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
        overflow: hidden;
        margin-bottom: 2rem;
    }

    .edit-header {
        background: #f9fafb;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
    }

    .edit-header h2 {
        margin: 0;
        color: #1f2937;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .big-gift-form {
        padding: 1.5rem;
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    .form-group.full-width {
        grid-column: 1 / -1;
    }

    .form-group label {
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #374151;
        font-size: 0.875rem;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .purchase-links-section {
        margin-bottom: 2rem;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .section-header h3 {
        margin: 0;
        color: #1f2937;
        font-size: 1rem;
        font-weight: 600;
    }

    .add-link-btn {
        background: #10b981;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .add-link-btn:hover {
        background: #059669;
    }

    .purchase-link-row {
        display: grid;
        grid-template-columns: 1fr 2fr auto;
        gap: 1rem;
        align-items: end;
        margin-bottom: 1rem;
    }

    .remove-link-btn {
        background: #ef4444;
        color: white;
        border: none;
        padding: 0.75rem;
        border-radius: 0.375rem;
        cursor: pointer;
        font-size: 1.2rem;
        line-height: 1;
        transition: background-color 0.2s;
    }

    .remove-link-btn:hover {
        background: #dc2626;
    }

    .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        padding-top: 1.5rem;
        border-top: 1px solid #e5e7eb;
    }

    .cancel-btn,
    .save-btn {
        padding: 0.75rem 1.5rem;
        border-radius: 0.375rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .cancel-btn {
        background: white;
        color: #6b7280;
        border: 1px solid #d1d5db;
    }

    .cancel-btn:hover {
        background: #f9fafb;
        border-color: #9ca3af;
    }

    .save-btn {
        background: #3b82f6;
        color: white;
        border: 1px solid #3b82f6;
    }

    .save-btn:hover {
        background: #2563eb;
        border-color: #2563eb;
    }

    .big-gifts-table-container {
        background: white;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
        overflow: hidden;
    }

    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: #6b7280;
    }

    .empty-state p {
        margin: 0 0 1.5rem 0;
        font-size: 1.125rem;
    }

    .big-gifts-table {
        width: 100%;
        border-collapse: collapse;
    }

    .big-gifts-table th {
        background: #f9fafb;
        padding: 1rem;
        text-align: left;
        font-weight: 600;
        color: #374151;
        border-bottom: 1px solid #e5e7eb;
        font-size: 0.875rem;
    }

    .big-gifts-table td {
        padding: 1rem;
        border-bottom: 1px solid #f3f4f6;
        vertical-align: top;
    }

    .big-gifts-table tr:hover {
        background: #f9fafb;
    }

    .big-gifts-table tr.fully-funded {
        background: rgba(16, 185, 129, 0.05);
    }

    .big-gifts-table tr.partially-funded {
        background: rgba(217, 119, 6, 0.05);
    }

    .big-gifts-table tr.not-funded {
        background: rgba(220, 38, 38, 0.05);
    }

    .image-cell img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 0.375rem;
        border: 1px solid #e5e7eb;
    }

    .name-cell {
        min-width: 200px;
    }

    .gift-name {
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 0.25rem;
    }

    .gift-description {
        color: #6b7280;
        font-size: 0.875rem;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .target-cell {
        font-weight: 600;
        color: #1f2937;
        white-space: nowrap;
    }

    .progress-cell {
        min-width: 200px;
    }

    .progress-info {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .progress-amounts {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
    }

    .current {
        font-weight: 600;
        color: #1f2937;
    }

    .percentage {
        color: #6b7280;
        font-size: 0.8rem;
    }

    .progress-bar {
        width: 100%;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: #10b981;
        transition: width 0.3s ease;
        border-radius: 4px;
    }

    .fully-funded .progress-fill {
        background: #059669;
    }

    .partially-funded .progress-fill {
        background: #d97706;
    }

    .contributors-cell {
        min-width: 150px;
    }

    .contributor-count {
        font-weight: 600;
        color: #1f2937;
        display: block;
        margin-bottom: 0.5rem;
    }

    .contributor-list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .contributor-name {
        font-size: 0.8rem;
        color: #6b7280;
        padding: 0.25rem 0.5rem;
        background: #f3f4f6;
        border-radius: 0.25rem;
    }

    .more-contributors {
        font-size: 0.75rem;
        color: #9ca3af;
        font-style: italic;
    }

    .actions-cell {
        white-space: nowrap;
    }

    .edit-btn,
    .delete-btn {
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        cursor: pointer;
        border: 1px solid;
        margin-right: 0.5rem;
        transition: all 0.2s;
    }

    .edit-btn {
        background: white;
        color: #3b82f6;
        border-color: #3b82f6;
    }

    .edit-btn:hover {
        background: #3b82f6;
        color: white;
    }

    .delete-btn {
        background: white;
        color: #ef4444;
        border-color: #ef4444;
    }

    .delete-btn:hover {
        background: #ef4444;
        color: white;
    }

    .delete-disabled {
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        color: #9ca3af;
        border: 1px solid #e5e7eb;
        background: #f9fafb;
        cursor: not-allowed;
    }

    @media (max-width: 1024px) {
        .big-gifts-admin {
            padding: 1rem;
        }

        .admin-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
        }

        .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }

        .form-grid {
            grid-template-columns: 1fr;
        }

        .purchase-link-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
        }

        .big-gifts-table-container {
            overflow-x: auto;
        }

        .big-gifts-table {
            min-width: 800px;
        }
    }

    @media (max-width: 640px) {
        .stats-grid {
            grid-template-columns: 1fr 1fr;
        }

        .stat-card {
            padding: 1rem;
        }

        .stat-number {
            font-size: 1.5rem;
        }

        .form-actions {
            flex-direction: column;
        }

        .cancel-btn,
        .save-btn {
            width: 100%;
        }
    }
</style>