import { error, json } from '@sveltejs/kit';
import { type Gift, giftRepository } from '$lib/server/db/gift-repository.js';
import type { RequestHandler } from './$types';
import { handleApiError } from '$lib/server/utils';
import { currencies } from '$lib/server/db/schema.js';
import { requireAdmin } from '$lib/server/api-auth.js';

export const prerender = false;

export const GET: RequestHandler = async (event) => {
	const adminContext = requireAdmin(event);

	const { locals, url } = event;

	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const filter = url.searchParams.get('filter');
		const includePrivate = url.searchParams.get('includePrivate') === 'true';

		let gifts: Gift[];
		switch (filter) {
			case 'available': {
				const allGifts = await giftRepository.findAllAdmin(locals.db);
				gifts = allGifts.filter((g) => !g.isTaken);
				break;
			}
			case 'taken': {
				const allGiftsTaken = await giftRepository.findAllAdmin(locals.db);
				gifts = allGiftsTaken.filter((g) => g.isTaken);
				break;
			}
			default:
				gifts = await giftRepository.findAllAdmin(locals.db);
		}

		const responseGifts = includePrivate
			? gifts.map((gift) => ({
					...gift,
					actualReserverName: gift.isTaken ? gift.takenBy : null,
					adminNotes: `Privacy: ${gift.hideReserverName ? 'Hidden' : 'Public'}`
				}))
			: gifts;

		return json({
			gifts: responseGifts,
			total: gifts.length,
			available: gifts.filter((g) => !g.isTaken).length,
			taken: gifts.filter((g) => g.isTaken).length,
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
		// Note: You might want to define a proper CreateGiftRequest interface
		const giftData = (await request.json()) as {
			name: string;
			description: string;
			imagePath: string;
			approximatePrice: number;
			currency: string;
			purchaseLinks?: Array<{ siteName: string; url: string }>;
		};

		// Basic validation
		if (!giftData.name || !giftData.description || !giftData.imagePath) {
			throw error(400, 'Name, description, and image path are required');
		}

		if (!isValidCurrency(giftData.currency)) {
			throw error(400, 'Invalid currency');
		}

		if (giftData.approximatePrice <= 0) {
			throw error(400, 'Price must be greater than 0');
		}

		// Prepare gift data for creation
		const newGiftData = {
			name: giftData.name,
			description: giftData.description,
			imagePath: giftData.imagePath,
			approximatePrice: giftData.approximatePrice,
			currency: giftData.currency as (typeof currencies)[number],
			purchaseLinks: giftData.purchaseLinks || [],
			isTaken: false,
			takenBy: null,
			hideReserverName: false
		};

		// Use createAdmin to get full Gift object back
		const created = await giftRepository.createAdmin(locals.db, newGiftData);

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
