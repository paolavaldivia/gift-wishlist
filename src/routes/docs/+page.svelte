<script lang="ts">
	import { onMount } from 'svelte';

	let markdownContent = '';
let loading = true;
let error = '';

onMount(async () => {
	try {
		const response = await fetch('/api/docs/markdown');
		if (response.ok) {
			markdownContent = await response.text();
		} else {
			error = 'Failed to load documentation';
		}
	} catch {
		error = 'Error fetching documentation';
	} finally {
		loading = false;
	}
});

// Simple markdown to HTML converter (or use a library like marked)
function markdownToHtml(markdown: string): string {
	return markdown
		.replace(/^### (.*$)/gim, '<h3>$1</h3>')
		.replace(/^## (.*$)/gim, '<h2>$1</h2>')
		.replace(/^# (.*$)/gim, '<h1>$1</h1>')
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		.replace(/`([^`]+)`/g, '<code>$1</code>')
		.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
		.replace(/^\- (.*)$/gim, '<li>$1</li>')
		.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
		.replace(/\n\n/g, '</p><p>')
		.replace(/^(.*)$/gim, '<p>$1</p>')
		.replace(/<p><\/p>/g, '')
		.replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1')
		.replace(/<p>(<ul>.*<\/ul>)<\/p>/g, '$1')
		.replace(/<p>(<pre>.*<\/pre>)<\/p>/g, '$1');
}
</script>

<svelte:head>
<title>API Documentation - Gift Registry</title>
<style>
pre {
	background: #f5f5f5;
	padding: 1rem;
	border-radius: 0.5rem;
	overflow-x: auto;
}
code {
	background: #f0f0f0;
	padding: 0.2rem 0.4rem;
	border-radius: 0.25rem;
	font-family: 'Courier New', monospace;
}
h1, h2, h3 {
	margin-top: 2rem;
	margin-bottom: 1rem;
}
h1 { border-bottom: 2px solid #e5e5e5; padding-bottom: 0.5rem; }
h2 { border-bottom: 1px solid #e5e5e5; padding-bottom: 0.3rem; }
</style>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
	{#if loading}
	<div class="flex items-center justify-center h-64">
<div class="text-lg">Loading documentation...</div>
</div>
{:else if error}
<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
	{error}
	</div>
{:else}
<div class="prose max-w-none">
	{@html markdownToHtml(markdownContent)}
	</div>

	<div class="mt-8 p-4 bg-blue-50 rounded-lg">
<h3 class="text-lg font-semibold mb-2">Quick Links</h3>
<div class="space-y-2">
<a href="/api/docs/markdown" class="text-blue-600 hover:underline block">
					📄 Raw Markdown
</a>
<a href="/api/docs/postman" class="text-blue-600 hover:underline block">
					📮 Postman Collection (JSON)
</a>
<a href="/api" class="text-blue-600 hover:underline block">
					🔗 API Root
</a>
</div>
</div>
{/if}
</div>