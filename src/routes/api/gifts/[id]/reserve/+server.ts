import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { giftRepository } from '$lib/server/db/gift-repository.js';
import { handleApiError } from '$lib/server/utils';

export const prerender = false;

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const requestBody = (await request.json()) as {
			takenBy: string;
			hideReserverName?: boolean;
		};

		const { takenBy, hideReserverName } = requestBody;

		if (!takenBy || typeof takenBy !== 'string' || takenBy.trim().length === 0) {
			throw error(400, 'Valid name is required');
		}

		if (takenBy.trim().length > 100) {
			throw error(400, 'Name is too long (max 100 characters)');
		}

		const existingGift = await giftRepository.findById(locals.db, params.id);
		if (!existingGift) {
			throw error(404, 'Gift not found');
		}

		if (existingGift.isTaken) {
			throw error(409, 'Gift is already reserved'); // 409 Conflict
		}

		const reserved = await giftRepository.reserve(
			locals.db,
			params.id,
			takenBy.trim(),
			hideReserverName || false
		);

		if (!reserved) {
			throw error(500, 'Failed to reserve gift');
		}

		return json({
			success: true,
			gift: {
				id: reserved.id,
				name: reserved.name,
				isTaken: reserved.isTaken,
				takenBy: reserved.takenBy, // Already respects privacy
				isAnonymous: reserved.isAnonymous
			},
			message: 'Gift reserved successfully'
		});
	} catch (err) {
		handleApiError(err, 'Failed to reserve gift', 'POST /api/gifts/[id]/reserve');
	}
};
