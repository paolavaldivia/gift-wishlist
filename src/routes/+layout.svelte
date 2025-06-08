<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import Footer from '$lib/components/Footer.svelte';
	import '../app.css';

	function isActive(locale: string) {
		const localeOptions = locales.map((locale) => `/${locale}`);
		const pageIncludesLocale = page.url.pathname.includes(locale);
		const pageIncludesAnyLocale = localeOptions.some((localeOption) => page.url.pathname.includes(localeOption));
		return pageIncludesLocale || (!pageIncludesAnyLocale && locale === 'en');
	}

</script>

<nav class="language-selector">
	<div class="language-toggle">🌐</div>
	<div class="language-options">
		{#each locales as locale (locale)}
			<a
				href={localizeHref(page.url.pathname, { locale })}
				class="lang-link"
				class:active={isActive(locale)}
				data-sveltekit-reload
			>
				{locale === 'fr' ? '🇫🇷' : locale === 'en' ? '🇬🇧' : '🇵🇪'}
			</a>
		{/each}
	</div>
</nav>

<main>
	<slot></slot>
</main>

<Footer />

<svelte:head>
	<title>{m.title()}</title>
</svelte:head>


<style>
    .language-selector {
        display: flex;
        flex-direction: row;
				width: 100%;
				justify-content: flex-end;
				padding-inline: 1rem;
				padding-block: 0.5rem;
				background: #ecf0f1;
    }

    .language-toggle {
        width: 40px;
        height: 40px;
        background: white;
        padding: 0.5rem;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        font-size: 1.2rem;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        align-self: flex-end;
				justify-self: flex-end;
    }

    .language-options {
        display: none;
        flex-direction: column;
        gap: 0.5rem;
        background: white;
        padding: 0.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-top: 0.5rem;
    }

    .language-selector:hover .language-options {
        display: flex;
    }

    .lang-link {
        padding: 0.5rem;
        text-decoration: none;
        color: #7f8c8d;
        border-radius: 4px;
        transition: all 0.2s ease;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .lang-link:hover {
        background: #ecf0f1;
        color: #2c3e50;
    }

    .lang-link.active {
        background: #3498db;
        color: white;
    }

    main {
        min-height: calc(100vh - 200px);
    }
</style>