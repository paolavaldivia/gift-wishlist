<script>
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
</script>

<slot></slot>

<svelte:head>
	<title>{m.title()}</title>
</svelte:head>

<div style="display:none">
{#each locales as locale (locale)}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
{/each}
</div>