import { error, json } from '@sveltejs/kit';
import { generateId, giftsQueries } from '$lib/server/db/queries';
import type { RequestHandler } from './$types';
import type { Gift } from '$lib/types/gift';
import { handleApiError } from '$lib/server/utils';
import { currencies } from '$lib/server/db/schema';

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const filter = url.searchParams.get('filter');

		let gifts;
		switch (filter) {
			case 'available':
				gifts = await giftsQueries.getAvailable(locals.db);
				break;
			case 'taken':
				gifts = await giftsQueries.getTaken(locals.db);
				break;
			default:
				gifts = await giftsQueries.getAll(locals.db);
		}

		return json(gifts);
	} catch (err) {
		handleApiError(err, 'Failed to fetch gifts', 'GET /api/gifts');
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const giftData = (await request.json()) as Omit<Gift, 'id'>;

		if (!currencies.includes(giftData.currency)) {
			throw error(400, 'Invalid currency');
		}

		// Add ID and timestamps
		const newGift = {
			id: generateId(),
			...giftData,
			isTaken: false,
			takenBy: null,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const created = await giftsQueries.create(locals.db, newGift);
		return json(created, { status: 201 });
	} catch (err) {
		handleApiError(err, 'Failed to create gift', 'POST /api/gifts');
	}
};
