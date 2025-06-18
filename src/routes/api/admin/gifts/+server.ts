import { error, json } from '@sveltejs/kit';
import { generateId, giftsQueries } from '$lib/server/db/queries';
import type { RequestHandler } from './$types';
import type { Gift } from '$lib/types/gift';
import { handleApiError } from '$lib/server/utils';
import { currencies } from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/api-auth';

export const prerender = false;

// Admin-only endpoint to get all gifts with full details
export const GET: RequestHandler = async (event) => {
	// Require admin authentication
	const adminContext = requireAdmin(event);

	const { locals, url } = event;

	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const filter = url.searchParams.get('filter');
		const includePrivate = url.searchParams.get('includePrivate') === 'true';

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

		// For admin, optionally include private information
		if (includePrivate) {
			// Admin can see actual reserver names even if hidden
			gifts = gifts.map((gift) => ({
				...gift,
				actualReserverName: gift.isTaken ? gift.takenBy : null
			}));
		}

		return json({
			gifts,
			requestedBy: adminContext.userId,
			timestamp: new Date().toISOString()
		});
	} catch (err) {
		handleApiError(err, 'Failed to fetch gifts', 'GET /api/admin/gifts');
	}
};

function isValidCurrency(value: string): value is (typeof currencies)[number] {
	return currencies.includes(value as any);
}

// Admin-only endpoint to create gifts
export const POST: RequestHandler = async (event) => {
	// Require admin authentication
	const adminContext = requireAdmin(event);

	const { locals, request } = event;

	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const giftData = (await request.json()) as Omit<Gift, 'id'>;

		if (!isValidCurrency(giftData.currency)) {
			throw error(400, 'Invalid currency');
		}

		// Add ID and timestamps
		const newGift = {
			id: generateId(),
			...giftData,
			currency: giftData.currency as (typeof currencies)[number],
			isTaken: false,
			takenBy: null,
			hideReserverName: false,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const created = await giftsQueries.create(locals.db, newGift);

		return json(
			{
				gift: created,
				createdBy: adminContext.userId,
				timestamp: new Date().toISOString()
			},
			{ status: 201 }
		);
	} catch (err) {
		handleApiError(err, 'Failed to create gift', 'POST /api/admin/gifts');
	}
};
