<script lang="ts">
	import { fly } from 'svelte/transition';
	import DonationSection from '$lib/components/DonationSection.svelte';
	import HeroHeader from '$lib/components/HeroHeader.svelte';
	import type { BigGift, Gift } from '$lib/types/gift';
	import type { PageProps } from './$types';
	import GiftsSection from '$lib/components/GiftsSection.svelte';

	let { data, form }: PageProps = $props();
	let gifts = $state<Gift[]>(data.gifts);
	let bigGifts = $state<BigGift[]>(data.bigGifts);

	let errorNotification = $state<{ show: boolean; message: string }>({
		show: false,
		message: ''
	});

	function showErrorNotification(message: string) {
		errorNotification = { show: true, message };
	}

	function hideErrorNotification() {
		errorNotification.show = false;
	}

</script>

<!-- Hero Header -->
<HeroHeader />

<!-- Error Notification -->
{#if errorNotification.show}
	<div class="error-notification" transition:fly={{ y: -20, duration: 300 }} role="alert">
		<span class="error-text">{errorNotification.message}</span>
		<button class="error-close" onclick={hideErrorNotification}>×</button>
	</div>
{/if}

<div class="container">
	{#if gifts && gifts.length > 0 || bigGifts && bigGifts.length > 0}
		<GiftsSection
			{gifts}
			{bigGifts}
			form={form}
			onShowError={showErrorNotification}
			onHideError={hideErrorNotification}
		/>
	{/if}

	<DonationSection />
</div>



<style>
    .error-notification {
        position: fixed;
        top: var(--spacing-lg);
        right: var(--spacing-lg);
        z-index: var(--z-notification);
        background: var(--color-danger);
        color: white;
        padding: var(--spacing-md) var(--spacing-lg);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 400px;
    }

    .error-text {
        flex: 1;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
    }

    .error-close {
        background: none;
        border: none;
        color: white;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s ease;
    }

    .error-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .container {
        max-width: var(--container-max-width);
        margin: 0 auto;
        padding-inline: var(--spacing-xl);
    }

    @media (max-width: 768px) {
        .container {
            padding-inline: var(--spacing-md);
        }
        .error-notification {
            top: auto;
            bottom: var(--spacing-lg);
            right: var(--spacing-md);
            left: var(--spacing-md);
            max-width: calc(100% - 2 * var(--spacing-md));
        }
    }
</style>