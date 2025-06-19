import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { giftRepository } from '$lib/server/db/gift-repository.js';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const gift = await giftRepository.findById(locals.db, params.id);

		if (!gift) {
			throw error(404, 'Gift not found');
		}

		return json(gift);
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err && err.status === 404) throw err;
		console.error('Failed to fetch gift:', err);
		throw error(500, 'Failed to fetch gift');
	}
};

// Simplified PATCH endpoint - only for reservations (no unreserve)
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		// Type the request body properly to fix TS error
		const requestBody = (await request.json()) as {
			action?: string;
			name?: string;
			hideReserverName?: boolean;
		};

		const { action, name, hideReserverName = false } = requestBody;

		// Only allow 'reserve' action
		if (action !== 'reserve') {
			throw error(
				400,
				'Only "reserve" action is allowed. Use /api/gifts/[id]/reserve for reservations.'
			);
		}

		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			throw error(400, 'Valid name is required for reservation');
		}

		if (name.trim().length > 100) {
			throw error(400, 'Name is too long (max 100 characters)');
		}

		// Check if already taken - findById returns PublicGift
		const existingGift = await giftRepository.findById(locals.db, params.id);
		if (!existingGift) {
			throw error(404, 'Gift not found');
		}
		if (existingGift.isTaken) {
			throw error(409, 'Gift is already reserved');
		}

		// Reserve the gift - returns PublicGift with privacy applied
		const reserved = await giftRepository.reserve(
			locals.db,
			params.id,
			name.trim(),
			hideReserverName
		);
		if (!reserved) {
			throw error(404, 'Gift not found');
		}

		return json({
			success: true,
			gift: reserved,
			message: `Successfully reserved "${reserved.name}"`
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) throw err;
		console.error('Failed to reserve gift:', err);
		throw error(500, 'Failed to reserve gift');
	}
};
