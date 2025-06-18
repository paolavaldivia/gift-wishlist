import { createD1Client } from '$lib/server/db/config';
import type { RequestHandler } from './$types';
import { seedDatabase } from '$lib/server/db/seedUtils';
import { requireAdmin } from '$lib/server/api-auth';
import { json } from '@sveltejs/kit';

export const prerender = false;

export const GET: RequestHandler = async (event) => {
	// Require admin authentication
	const adminContext = requireAdmin(event);

	if (!event.platform?.env?.DB) {
		return new Response('Database not available', { status: 500 });
	}

	try {
		const db = createD1Client(event.platform.env.DB);
		await seedDatabase(db);

		return json({
			message: 'Database seeded successfully!',
			seededBy: adminContext.userId,
			timestamp: new Date().toISOString()
		});
	} catch (err) {
		console.error('Failed to seed database:', err);
		return new Response(`Failed to seed database: ${err}`, { status: 500 });
	}
};
