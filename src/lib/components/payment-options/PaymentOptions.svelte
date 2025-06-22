<script lang="ts">
	import PayPalButton from '$lib/components/payment-options/PayPalButton.svelte';
	import BankTransferOption from '$lib/components/payment-options/BankTransferOption.svelte';
</script>

<div class="payment-options">
	<div class="payment-option">
		<BankTransferOption />
	</div>
	<div class="payment-option">
		<PayPalButton />
	</div>

</div>


<style>
    .payment-options {
        display: grid;
        gap: var(--spacing-xl);
    }
    /* Payment options styles */
    .payment-option {
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        background: var(--color-gray-50);
    }

    :global(.payment-option h3) {
        font-size: var(--font-size-xl);
        margin-bottom: var(--spacing-sm);
        color: var(--color-primary);
    }
</style>