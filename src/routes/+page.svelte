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

<div class="container">
	<header class="hero">
		<div class="hero-content">
			<h1>{m.heading()}</h1>
			<p class="subtitle">{m.subheading()}</p>
		</div>

		<!-- Placeholder for the belly photo -->
		<div class="hero-image">
			<!-- You can replace this with the actual image later -->
			<div class="image-placeholder">
				<span>Photo du bidou à venir 📸</span>
			</div>
		</div>
	</header>

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
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .hero {
        margin-bottom: 4rem;
        padding: 3rem;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border-radius: 16px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        align-items: center;
    }

    .hero-content {
        text-align: left;
    }

    .hero h1 {
        font-size: 2.5rem;
        color: #2c3e50;
        margin-bottom: 1rem;
        font-weight: 700;
        line-height: 1.2;
    }

    .subtitle {
        font-size: 1.2rem;
        color: #7f8c8d;
        margin: 0;
        line-height: 1.6;
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
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px dashed #c3cfe2;
        color: #7f8c8d;
        font-size: 1.1rem;
    }

    /* When you add the actual image, use this style */
    .hero-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .gift-section {
        margin-bottom: 4rem;
    }

    .gift-section h2 {
        font-size: 2.5rem;
        text-align: center;
        color: #2c3e50;
        margin-bottom: 1rem;
    }

    .section-description {
        text-align: center;
        color: #7f8c8d;
        font-size: 1.1rem;
        margin-bottom: 3rem;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
    }

    .gift-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
        margin-bottom: 4rem;
    }

    @media (max-width: 768px) {
        .container {
            padding: 1rem;
        }

        .hero {
            padding: 2rem 1rem;
            grid-template-columns: 1fr;
            text-align: center;
        }

        .hero-content {
            text-align: center;
        }

        .hero h1 {
            font-size: 2rem;
        }

        .subtitle {
            font-size: 1.1rem;
        }

        .hero-image {
            min-height: 200px;
            margin-top: 2rem;
        }

        .gift-section h2 {
            font-size: 2rem;
        }

        .gift-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
    }
</style>