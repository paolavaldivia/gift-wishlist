<script lang="ts">

	import * as m from '$lib/paraglide/messages';

	export let paypalLink = 'https://paypal.me/valdiviap';
</script>
	<h3>PayPal</h3>
	<p>{m['donation.paypalDescription']()}</p>
	<a href={paypalLink} target="_blank" rel="noopener noreferrer" class="btn btn-paypal">
		<span class="paypal-icon">💸</span> {m['donation.paypalButton']()}
	</a>

<style>

    .btn-paypal {
        background: #0070ba;
        color: white;
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-sm);
        text-decoration: none;
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--radius-full);
        transition: all var(--transition-fast);
    }

    .btn-paypal:hover {
        background: #005ea6;
        transform: translateY(-2px);
    }

    .paypal-icon {
        font-size: 1.2em;
    }
</style>