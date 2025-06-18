import { error, json } from '@sveltejs/kit';
import { giftsQueries } from '$lib/server/db/queries';
import type { RequestHandler } from './$types';
import { handleApiError } from '$lib/server/utils';

export const prerender = false;

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

		// Sanitize data for public consumption - remove sensitive admin info
		const publicGifts = gifts.map((gift) => ({
			id: gift.id,
			name: gift.name,
			description: gift.description,
			imagePath: gift.imagePath,
			approximatePrice: gift.approximatePrice,
			currency: gift.currency,
			purchaseLinks: gift.purchaseLinks,
			isTaken: gift.isTaken,
			// Only show reserver name if privacy is not enabled
			takenBy: gift.isTaken && !gift.hideReserverName ? gift.takenBy : null,
			isAnonymous: gift.isTaken && gift.hideReserverName,
			createdAt: gift.createdAt,
			updatedAt: gift.updatedAt
		}));

		return json({
			gifts: publicGifts,
			total: publicGifts.length,
			available: publicGifts.filter((g) => !g.isTaken).length,
			taken: publicGifts.filter((g) => g.isTaken).length
		});
	} catch (err) {
		handleApiError(err, 'Failed to fetch gifts', 'GET /api/gifts');
	}
};
