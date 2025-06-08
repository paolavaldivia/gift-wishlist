<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import GiftCard from '$lib/components/GiftCard.svelte';
	import DonationSection from '$lib/components/DonationSection.svelte';
	import { mockGifts } from '$lib/data/mockGifts';
	import type { Gift } from '$lib/types/gift';

	let gifts = $state<Gift[]>([...mockGifts]);

	function handleReserve(giftId: string) {
		// This is where you would normally make an API call
		// For now, we'll just show a prompt
		const name = prompt('Votre nom / Your name / Su nombre:');
		if (name) {
			gifts = gifts.map(gift =>
				gift.id === giftId
					? { ...gift, isTaken: true, takenBy: name }
					: gift
			);
			alert(m['giftList.thankYou']({ name }));
		}
	}

	function handleDonate() {
		// This would open a payment modal or redirect to payment page
		alert('La fonction de donation sera bientôt disponible! / Donation feature coming soon! / ¡Función de donación próximamente!');
	}
</script>
<header class="hero">
	<div class="hero-content-container">
	<div class="hero-content">
		<h1>{m.heading()}</h1>
		<p class="subtitle">{m.subheading()}</p>
	</div>
	</div>

	<!-- Placeholder for the belly photo -->
	<div class="hero-image">
		<div class="image-placeholder">
			<span>Photo du bidou à venir 📸</span>
		</div>
	</div>
</header>

<div class="container">


	<section class="gift-section">
		<h2>{m['giftList.title']()}</h2>
		<p class="section-description">{m['giftList.description']()}</p>

		<div class="gift-grid">
			{#each gifts as gift (gift.id)}
				<GiftCard {gift} onReserve={handleReserve} />
			{/each}
		</div>
	</section>

	<DonationSection
		currentAmount={150}
		onDonate={handleDonate}
	/>
</div>

<style>
    .container {
        max-width: var(--container-max-width);
        margin: 0 auto;
        padding: var(--spacing-xl);
    }

    .hero {
        margin-bottom: var(--spacing-3xl);
        padding: var(--spacing-2xl);
        background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-gray-300) 100%);
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-2xl);
        align-items: center;
    }

		.hero-content-container {
				width: 100%;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
		}

    .hero-content {
				max-width: 400px;
    }

    .hero h1 {
        font-size: var(--font-size-4xl);
        color: var(--color-gray-800);
        margin-bottom: var(--spacing-md);
        font-weight: var(--font-weight-bold);
        line-height: var(--line-height-tight);
    }

    .subtitle {
        font-size: var(--font-size-lg);
        color: var(--color-gray-600);
        margin: 0;
        line-height: var(--line-height-relaxed);
    }

    .hero-image {
        width: 100%;
        height: 100%;
        min-height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .image-placeholder {
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.5);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px dashed var(--color-secondary);
        color: var(--color-gray-500);
        font-size: var(--font-size-lg);
    }

    .hero-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
    }

    .gift-section {
        margin-bottom: var(--spacing-3xl);
    }

    .gift-section h2 {
        font-size: var(--font-size-3xl);
        text-align: center;
        color: var(--color-gray-800);
        margin-bottom: var(--spacing-md);
    }

    .section-description {
        text-align: center;
        color: var(--color-gray-600);
        font-size: var(--font-size-lg);
        margin-bottom: var(--spacing-2xl);
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
    }

    .gift-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--grid-gap);
        margin-bottom: var(--spacing-3xl);
    }

    @media (max-width: 768px) {
        .container {
            padding: var(--spacing-md);
        }

        .hero {
            padding: var(--spacing-lg) var(--spacing-md);
            grid-template-columns: 1fr;
            text-align: center;
        }

        .hero-content {
            text-align: center;
        }

        .hero h1 {
            font-size: var(--font-size-3xl);
        }

        .subtitle {
            font-size: var(--font-size-base);
        }

        .hero-image {
            min-height: 200px;
            margin-top: var(--spacing-lg);
        }

        .gift-section h2 {
            font-size: var(--font-size-2xl);
        }

        .gift-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-lg);
        }
    }
</style>