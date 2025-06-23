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
        padding: var(--spacing-xl);
        max-width: var(--container-max-width);
        margin: 0 auto;
    }

    .admin-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--spacing-xl);
        gap: var(--spacing-xl);
    }

    .header-content h1 {
        margin: 0 0 var(--spacing-sm) 0;
        color: var(--color-gray-800);
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-semibold);
    }

    .header-content p {
        margin: 0;
        color: var(--color-gray-600);
        font-size: var(--font-size-base);
    }

    .new-big-gift-btn {
        background: var(--color-primary);
        color: var(--color-white);
        border: none;
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--radius-md);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        transition: background-color var(--transition-fast);
    }

    .new-big-gift-btn:hover {
        background: var(--color-primary-dark);
    }

    .new-big-gift-btn .icon {
        font-size: var(--font-size-lg);
        font-weight: bold;
    }

    .message {
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-lg);
        font-weight: var(--font-weight-medium);
    }

    .message.success {
        background: var(--color-success-light);
        color: var(--color-success);
        border: 1px solid var(--color-success-light);
    }

    .message.error {
        background: var(--color-error-light);
        color: var(--color-error);
        border: 1px solid var(--color-error-light);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-xl);
    }

    .stat-card {
        background: var(--color-white);
        padding: var(--spacing-lg);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-gray-200);
        text-align: center;
        box-shadow: var(--shadow-sm);
    }

    .stat-card h3 {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--font-size-sm);
        color: var(--color-gray-600);
        text-transform: uppercase;
        font-weight: var(--font-weight-medium);
        letter-spacing: 0.05em;
    }

    .stat-number {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-gray-800);
    }

    .stat-number.fully-funded {
        color: var(--color-success);
    }

    .stat-number.partially-funded {
        color: var(--color-warning);
    }

    .stat-number.not-funded {
        color: var(--color-danger);
    }

    .edit-section {
        background: var(--color-white);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-gray-200);
        overflow: hidden;
        margin-bottom: var(--spacing-xl);
        box-shadow: var(--shadow-sm);
    }

    .edit-header {
        background: var(--color-gray-100);
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--color-gray-200);
    }

    .edit-header h2 {
        margin: 0;
        color: var(--color-gray-800);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
    }

    .big-gift-form {
        padding: var(--spacing-lg);
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-xl);
    }

    .form-group {
        display: flex;
        flex-direction: column;
        margin-bottom: var(--spacing-md);
    }

    .form-group.full-width {
        grid-column: 1 / -1;
    }

    label {
        display: block;
        margin-bottom: var(--spacing-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-gray-700);
    }

    input, select, textarea {
        width: 100%;
        padding: var(--spacing-sm);
        border: 1px solid var(--color-gray-300);
        border-radius: var(--radius-md);
        font-size: var(--font-size-base);
    }

    input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px var(--color-primary-light);
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
        margin: 0;
        color: var(--color-gray-800);
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
    }

    .add-link-btn {
        background: var(--color-success);
        color: var(--color-white);
        border: none;
        padding: var(--spacing-xs) var(--spacing-md);
        border-radius: var(--radius-md);
        font-size: var(--font-size-sm);
        cursor: pointer;
        transition: background-color var(--transition-fast);
    }

    .add-link-btn:hover {
        background: var(--color-success-dark);
    }

    .purchase-link-row {
        display: grid;
        grid-template-columns: 1fr 2fr auto;
        gap: var(--spacing-md);
        align-items: end;
        margin-bottom: var(--spacing-md);
        padding: var(--spacing-md);
        background-color: var(--color-gray-50);
        border: 1px solid var(--color-gray-200);
        border-radius: var(--radius-md);
    }

    .remove-link-btn {
        background: var(--color-danger);
        color: var(--color-white);
        border: none;
        padding: var(--spacing-xs) var(--spacing-xs);
        border-radius: var(--radius-md);
        cursor: pointer;
        font-size: var(--font-size-lg);
        line-height: 1;
        transition: background-color var(--transition-fast);
        height: var(--button-height);
        width: var(--button-height);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .remove-link-btn:hover {
        background: var(--color-danger-dark);
    }

    .form-actions {
        display: flex;
        gap: var(--spacing-md);
        justify-content: flex-end;
        padding-top: var(--spacing-lg);
        border-top: 1px solid var(--color-gray-200);
    }

    .cancel-btn,
    .save-btn {
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--radius-md);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: all var(--transition-fast);
        height: var(--button-height);
    }

    .cancel-btn {
        background: var(--color-white);
        color: var(--color-gray-600);
        border: 1px solid var(--color-gray-300);
    }

    .cancel-btn:hover {
        background: var(--color-gray-100);
        border-color: var(--color-gray-400);
    }

    .save-btn {
        background: var(--color-primary);
        color: var(--color-white);
        border: 1px solid var(--color-primary);
    }

    .save-btn:hover {
        background: var(--color-primary-dark);
        border-color: var(--color-primary-dark);
    }

    .big-gifts-table-container {
        background: var(--color-white);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-gray-200);
        overflow: hidden;
    }

    .empty-state {
        text-align: center;
        padding: var(--spacing-3xl) var(--spacing-xl);
        color: var(--color-gray-500);
    }

    .empty-state p {
        margin: 0 0 var(--spacing-lg) 0;
        font-size: var(--font-size-lg);
    }

    .big-gifts-table {
        width: 100%;
        border-collapse: collapse;
    }

    .big-gifts-table th {
        background: var(--color-gray-100);
        padding: var(--spacing-md);
        text-align: left;
        font-weight: var(--font-weight-semibold);
        color: var(--color-gray-700);
        border-bottom: 1px solid var(--color-gray-200);
        font-size: var(--font-size-sm);
    }

    .big-gifts-table td {
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--color-gray-100);
        vertical-align: top;
    }

    .big-gifts-table tr:hover {
        background: var(--color-gray-50);
    }

    .big-gifts-table tr.fully-funded {
        background: rgba(var(--color-success-rgb), 0.05);
    }

    .big-gifts-table tr.partially-funded {
        background: rgba(var(--color-warning-rgb), 0.05);
    }

    .big-gifts-table tr.not-funded {
        background: rgba(var(--color-danger-rgb), 0.05);
    }

    .image-cell img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-gray-200);
    }

    .name-cell {
        min-width: 200px;
    }

    .gift-name {
        font-weight: var(--font-weight-semibold);
        color: var(--color-gray-800);
        margin-bottom: var(--spacing-xs);
    }

    .gift-description {
        color: var(--color-gray-600);
        font-size: var(--font-size-sm);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .target-cell {
        font-weight: var(--font-weight-semibold);
        color: var(--color-gray-800);
        white-space: nowrap;
    }

    .progress-cell {
        min-width: 200px;
    }

    .progress-info {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }

    .progress-amounts {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--font-size-sm);
    }

    .current {
        font-weight: var(--font-weight-semibold);
        color: var(--color-gray-800);
    }

    .percentage {
        color: var(--color-gray-600);
        font-size: var(--font-size-xs);
    }

    .progress-bar {
        width: 100%;
        height: 8px;
        background: var(--color-gray-200);
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: var(--color-success);
        transition: width var(--transition-base);
        border-radius: 4px;
    }

    .fully-funded .progress-fill {
        background: var(--color-success);
    }

    .partially-funded .progress-fill {
        background: var(--color-warning);
    }

    .contributors-cell {
        min-width: 150px;
    }

    .contributor-count {
        font-weight: var(--font-weight-semibold);
        color: var(--color-gray-800);
        display: block;
        margin-bottom: var(--spacing-sm);
    }

    .contributor-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }

    .contributor-name {
        font-size: var(--font-size-xs);
        color: var(--color-gray-600);
        padding: var(--spacing-xs) var(--spacing-sm);
        background: var(--color-gray-100);
        border-radius: var(--radius-sm);
    }

    .more-contributors {
        font-size: var(--font-size-xs);
        color: var(--color-gray-500);
        font-style: italic;
    }

    .actions-cell {
        white-space: nowrap;
    }

    .edit-btn, .delete-btn {
        padding: var(--spacing-xs) var(--spacing-sm);
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-size: var(--font-size-sm);
        margin-right: var(--spacing-xs);
        height: var(--button-height);
    }

    .edit-btn {
        background-color: var(--color-primary-light);
        color: var(--color-primary);
    }

    .edit-btn:hover {
        background-color: var(--color-primary-lighter);
    }

    .delete-btn {
        background-color: var(--color-danger-light);
        color: var(--color-danger);
    }

    .delete-btn:hover {
        background-color: var(--color-danger-lighter);
    }

    .delete-disabled {
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-sm);
        background-color: var(--color-gray-200);
        color: var(--color-gray-500);
        cursor: not-allowed;
        opacity: 0.7;
    }

    @media (max-width: 1024px) {
        .big-gifts-admin {
            padding: var(--spacing-md);
        }

        .admin-header {
            flex-direction: column;
            align-items: stretch;
            gap: var(--spacing-md);
        }

        .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }

        .form-grid {
            grid-template-columns: 1fr;
        }

        .purchase-link-row {
            grid-template-columns: 1fr;
            gap: var(--spacing-sm);
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
            padding: var(--spacing-md);
        }

        .stat-number {
            font-size: var(--font-size-xl);
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