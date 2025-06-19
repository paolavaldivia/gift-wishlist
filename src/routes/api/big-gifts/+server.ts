import type { RequestHandler } from '../../../../.svelte-kit/types/src/routes/api/gifts/$types';
import { error, json } from '@sveltejs/kit';
import { bigGiftsQueries, generateId } from '$lib/server/db/gift-repository';
import type { BigGift } from '$lib/types/gift';
import { handleApiError } from '$lib/server/utils';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const bigGifts = await bigGiftsQueries.getAllWithContributors(locals.db);
		return json(bigGifts);
	} catch (err) {
		console.error('Failed to fetch big gifts:', err);
		throw error(500, 'Failed to fetch big gifts');
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const bigGiftData = (await request.json()) as Omit<BigGift, 'id'>;

		const newBigGift = {
			id: generateId(),
			...bigGiftData,
			currentAmount: 0,
			isTaken: false,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const created = await bigGiftsQueries.create(locals.db, newBigGift);
		return json(created, { status: 201 });
	} catch (err) {
		handleApiError(err, 'Failed to create big gift', 'POST /api/big-gifts');
	}
};
