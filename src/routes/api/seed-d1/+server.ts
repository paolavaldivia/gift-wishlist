import { createD1Client } from '$lib/server/db/config';
import type { RequestHandler } from '@sveltejs/kit';
import { seedDatabase } from '$lib/server/db/seedUtils';

export const prerender = false;

export const GET: RequestHandler = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return new Response('Database not available', { status: 500 });
	}

	const db = createD1Client(platform.env.DB);
	try {
		await seedDatabase(db);
		return new Response('Database seeded successfully!', { status: 200 });
	} catch (err) {
		console.error('Failed to seed database:', err);
		return new Response(`Failed to seed database: ${err}`, { status: 500 });
	}
};
