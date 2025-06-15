import type { PageServerLoad } from './$types';
import { giftsQueries } from '$lib/server/db/queries';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// Check if db is available
	if (!locals.db) {
		// During development or prerendering, return mock data
		return {
			gifts: []
		};
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
