import { generateMarkdownDocs } from '$lib/server/docs/generator.js';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const markdown = generateMarkdownDocs();

	return new Response(markdown, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
		}
	});
};
