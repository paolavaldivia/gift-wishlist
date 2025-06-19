import { error, json } from '@sveltejs/kit';
import { giftRepository } from '$lib/server/db/gift-repository.js';
import type { RequestHandler } from './$types';
import { handleApiError } from '$lib/server/utils';

export const prerender = false;

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const filter = url.searchParams.get('filter');
		const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
		const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);

		let gifts;
		switch (filter) {
			case 'available':
				gifts = await giftRepository.findAvailable(locals.db);
				break;
			case 'taken':
				gifts = await giftRepository.findTaken(locals.db);
				break;
			default:
				gifts = await giftRepository.findAll(locals.db);
		}

		// Apply pagination
		const paginatedGifts = gifts.slice(offset, offset + limit);

		return json({
			gifts: paginatedGifts,
			pagination: {
				total: gifts.length,
				limit,
				offset,
				hasMore: offset + limit < gifts.length
			},
			stats: {
				total: gifts.length,
				available: gifts.filter((g) => !g.isTaken).length,
				taken: gifts.filter((g) => g.isTaken).length
			}
		});
	} catch (err) {
		handleApiError(err, 'Failed to fetch gifts', 'GET /api/gifts');
	}
};
