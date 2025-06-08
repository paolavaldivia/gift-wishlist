<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import Footer from '$lib/components/Footer.svelte';
	import '../app.css';
	import '$lib/styles/mixins.css';

	function isActive(locale: string) {
		const localeOptions = locales.map((locale) => `/${locale}`);
		const pageIncludesLocale = page.url.pathname.includes(locale);
		const pageIncludesAnyLocale = localeOptions.some((localeOption) => page.url.pathname.includes(localeOption));
		return pageIncludesLocale || (!pageIncludesAnyLocale && locale === 'en');
	}

	function handleLanguageChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const locale = select.value;
		window.location.href = localizeHref(page.url.pathname, { locale });
	}

	function getLocaleName(locale: string): string {
		return locale === 'fr' ? 'Français' : locale === 'en' ? 'English' : 'Español';
	}

</script>

<nav class="language-selector">
	<div class="select-container">
		<label class="globe-label">
			<span class="globe-icon">🌐</span>
			<select
				aria-label="Select language"
				class="language-select"
				on:change={handleLanguageChange}
			>
				{#each locales as locale (locale)}
					<option value={locale} selected={isActive(locale)}>
						{getLocaleName(locale)}
					</option>
				{/each}
			</select>
		</label>
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

    .select-container {
        position: relative;
    }

    .globe-label {
        position: relative;
        display: flex;
        align-items: center;
    }

    .globe-icon {
        position: absolute;
        left: 0.5rem;
        z-index: 1;
        pointer-events: none;
    }

    .language-select {
        appearance: none;
        background: white;
        border: 1px solid #dde4e6;
        border-radius: 20px;
        padding: 0.5rem 2.5rem 0.5rem 2rem; /* Make room for the globe icon */
        font-size: 0.9rem;
        font-weight: 500;
        color: #2c3e50;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
        width: min-content;
    }

    .language-select:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-color: #bdc3c7;
    }

    .language-select:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }

    .select-container::after {
        content: "▼";
        font-size: 0.7rem;
        color: #7f8c8d;
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
    }

    main {
        min-height: calc(100vh - 200px);
    }

    @media (max-width: 768px) {
        .language-select {
            padding: 0.4rem 2rem 0.4rem 0.8rem;
            font-size: 0.85rem;
            min-width: 100px;
        }
    }
</style>