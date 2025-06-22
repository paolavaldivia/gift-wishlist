<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import Modal from '$lib/components/Modal.svelte';
	import PaymentOptions from '$lib/components/payment-options/PaymentOptions.svelte';

	export let show = false;
	export let onClose = () => {
		show = false;
	};

</script>

<Modal show={show} title={m['donation.title']()} {onClose} maxWidth="600px">
	<PaymentOptions/>
</Modal>
