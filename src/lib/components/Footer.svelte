<script lang="ts">
	let currentYear = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="container">
		<p class="made-with">
			Made with <span class="heart">❤️</span> for our little one
		</p>
		<p class="copyright">
			© {currentYear} Céline & Paola
		</p>
	</div>
</footer>

<style>
    .footer {
        background: var(--color-primary-dark);
        color: var(--color-white);
        padding: var(--spacing-xl) 0;
        margin-top: var(--spacing-3xl);
        text-align: center;
    }

    .container {
        max-width: var(--container-max-width);
        margin: 0 auto;
        padding: 0 var(--spacing-xl);
    }

    .made-with {
        font-size: var(--font-size-lg);
        margin-bottom: var(--spacing-sm);
    }

    .heart {
        color: var(--color-danger);
        animation: heartbeat var(--transition-base) infinite;
        display: inline-block;
    }

    .copyright {
        font-size: var(--font-size-sm);
        opacity: 0.8;
        margin: 0;
    }

    @keyframes heartbeat {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
</style>