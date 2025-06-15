import type { PageServerLoad } from './$types';
import { giftsQueries } from '$lib/server/db/queries';
import { error } from '@sveltejs/kit';
import { building } from '$app/environment';

export const load: PageServerLoad = async ({ locals }) => {
	// Check if db is available
	if (building) {
		return {
			gifts: []
		};
	}
	if (!locals.db) {
		console.error('Database not available');
		throw error(500, 'Database not available');
	}

	try {
		return {
			gifts: await giftsQueries.getAll(locals.db)
		};
	} catch (err) {
		console.error('Failed to load gifts:', err);
		throw error(500, 'Failed to load gifts');
	}
};
