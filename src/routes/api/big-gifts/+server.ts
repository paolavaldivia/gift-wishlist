import type { RequestHandler } from '../../../../.svelte-kit/types/src/routes/api/gifts/$types';
import { error, json } from '@sveltejs/kit';
import { handleApiError } from '$lib/server/utils';
import { bigGiftRepository } from '$lib/server/db/big-gift-repository';
import type { NewBigGift } from '$lib/server/db/schema';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const bigGifts = await bigGiftRepository.findAll(locals.db);
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
		const bigGiftData = (await request.json()) as Omit<
			NewBigGift,
			'id' | 'currentAmount' | 'isTaken'
		>;

		const newBigGift = {
			...bigGiftData
		};

		const created = await bigGiftRepository.create(locals.db, newBigGift);
		return json(created, { status: 201 });
	} catch (err) {
		handleApiError(err, 'Failed to create big gift', 'POST /api/big-gifts');
	}
};
