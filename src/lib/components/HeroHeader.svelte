<script lang="ts">
    import * as m from '$lib/paraglide/messages';
    import WaveClipPath from './WaveClipPath.svelte';
</script>

<WaveClipPath />
<header class="hero-container">
    <div class="hero wave-top">
        <div class="hero-content-container">
            <div class="hero-content">
                <h1>{m.heading()}</h1>
                <p class="subtitle">{m.subheading()}</p>
            </div>
        </div>

        <div class="pride-squares">
            <div class="pride-square" style="background-color: var(--color-pride-red)"></div>
            <div class="pride-square" style="background-color: var(--color-pride-orange)"></div>
            <div class="pride-square" style="background-color: var(--color-pride-yellow)"></div>
            <div class="pride-square" style="background-color: var(--color-pride-green)"></div>
            <div class="pride-square" style="background-color: var(--color-pride-blue)"></div>
            <div class="pride-square" style="background-color: var(--color-pride-purple)"></div>
            <div class="pride-square" style="background-color: var(--color-pride-pink)"></div>
        </div>

        <!-- Placeholder for the belly photo -->
        <div class="hero-image">
            <img src="/moni-belly.jpg" alt="Céline's Belly" />
        </div>
    </div>
</header>

<style>
    .hero-container {
        filter: drop-shadow(var(--shadow-sm));
    }

    .hero {
        margin-bottom: var(--spacing-3xl);
        padding: var(--spacing-2xl);
        background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-gray-300) 100%);
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-2xl);
        align-items: center;
        position: relative;
        overflow: hidden;
        box-shadow: var(--shadow-lg);
    }

    .hero::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: inherit;
        z-index: -1;
    }

    @keyframes wobble {
        0%,
        100% {
            d: path('M0,40 C80,30 100,50 200,40 C300,30 400,50 500,40 L500,0 L0,0 Z');
        }
        50% {
            d: path('M0,40 C120,50 200,30 300,50 C400,30 450,50 500,40 L500,0 L0,0 Z');
        }
    }

    .hero-content-container {
        width: 100%;
        padding-left: var(--spacing-lg);
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
        text-align: center;
    }

    .subtitle {
        font-size: var(--font-size-lg);
        color: var(--color-gray-600);
        margin: 0;
        line-height: var(--line-height-relaxed);
    }

    .hero-image {
        max-width: 450px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: var(--spacing-xs);
    }

    .hero-image img {
        width: 100%;
        height: auto;
        object-fit: cover;
        border-radius: var(--radius-lg);
        position: relative;
        z-index: 1;
    }

    .hero-image::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
            45deg,
            var(--color-pride-red),
            var(--color-pride-orange),
            var(--color-pride-yellow),
            var(--color-pride-green),
            var(--color-pride-blue),
            var(--color-pride-purple),
            var(--color-pride-pink)
        );
        border-radius: calc(var(--radius-lg) + 5px);
        z-index: 0;
        filter: blur(2px);
        opacity: 0.6;
    }

    .pride-squares {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        gap: var(--spacing-sm);
        display: flex;
        flex-direction: column;
        z-index: 1;
    }

    .pride-square {
        width: 20px;
        height: 20px;
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-sm);
        animation: var(--transition-slow) tilt;
    }

    @keyframes tilt {
        0% {
            transform: rotate(0deg);
        }
        50% {
            transform: scale(1.2) rotate(10deg);
        }
        100% {
            transform: scale(1) rotate(0deg);
        }
    }

    @media (max-width: 768px) {
        .hero {
            padding: var(--spacing-lg) var(--spacing-md) var(--spacing-2xl);
            grid-template-columns: 1fr;
            text-align: center;
            display: flex;
            flex-direction: column;
        }

        .hero-content {
            max-width: 80%;
            text-align: center;
            padding-left: 0;
            order: 1;
        }

        .hero-content-container {
            padding-left: 0;
        }

        .hero h1 {
            font-size: var(--font-size-3xl);
        }

        .subtitle {
            font-size: var(--font-size-base);
        }

        .hero-image {
            max-width: min(400px, 90%);
            min-height: 200px;
            margin-top: var(--spacing-lg);
            margin-bottom: var(--spacing-md);
            height: auto;
            order: 3;
        }

        .hero-image::before {
            filter: blur(5px);
        }

        .pride-squares {
            position: static;
            flex-direction: row;
            transform: none;
            justify-content: center;
            margin: var(--spacing-md) 0;
            padding: 0;
            z-index: 1;
            order: 2;
        }

        .pride-square {
            width: 20px;
            height: 20px;
        }
    }
</style>