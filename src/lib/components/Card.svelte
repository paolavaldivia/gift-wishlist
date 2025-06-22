<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let { imagePath, imageOverlay, title, description, content, actionContent, class: className } :{
		imagePath: string;
		imageOverlay: Snippet;
		title: string;
		description: string;
		content: Snippet;
		actionContent: Snippet;
		class?: ClassValue;
	} = $props();
</script>
<article class={[className, 'card']}>
	<div class="image-container">
		<img src={imagePath} alt={title} class="splat-clip" />
		{@render imageOverlay()}
	</div>
	<div class="content">
		<h3>{title}</h3>
		<p class="description">{description}</p>
		{@render content()}
		{#if actionContent}
			<div class="action-content">
			{@render actionContent()}
				</div>
		{/if}
	</div>
</article>

<style>
    .card {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .image-container  {
        position: relative;
        width: 100%;
        height: 200px;
        overflow: hidden;
        background: var(--color-gray-50);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .image-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--transition-base);
    }

    .image-container:hover img {
        transform: scale(1.05);
    }

    .content {
        padding: var(--spacing-lg);
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    h3 {
        margin: 0;
        font-size: var(--font-size-xl);
        color: var(--color-gray-800);
    }

    .description {
        color: var(--color-gray-500);
        font-size: var(--font-size-sm);
        line-height: var(--line-height-normal);
        margin: 0;
    }

    .action-content {
        margin-top: auto;
    }
</style>