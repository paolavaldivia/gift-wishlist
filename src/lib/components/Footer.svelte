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
        background: #2c3e50;
        color: white;
        padding: 2rem 0;
        margin-top: 4rem;
        text-align: center;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
    }

    .made-with {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
    }

    .heart {
        color: #e74c3c;
        animation: heartbeat 1.5s ease-in-out infinite;
        display: inline-block;
    }

    .copyright {
        font-size: 0.9rem;
        opacity: 0.8;
        margin: 0;
    }

    @keyframes heartbeat {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
</style>