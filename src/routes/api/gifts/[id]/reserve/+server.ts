import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { giftsQueries } from '$lib/server/db/queries';
import { handleApiError } from '$lib/server/utils';

export const prerender = false;

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const { takenBy, hideReserverName } = (await request.json()) as {
			takenBy: string;
			hideReserverName?: boolean;
		};

		// Validate input
		if (!takenBy || typeof takenBy !== 'string' || takenBy.trim().length === 0) {
			throw error(400, 'Valid name is required');
		}

		if (takenBy.trim().length > 100) {
			throw error(400, 'Name is too long');
		}

		// Check if gift exists and is available
		const existingGift = await giftsQueries.getById(locals.db, params.id);
		if (!existingGift) {
			throw error(404, 'Gift not found');
		}

		if (existingGift.isTaken) {
			throw error(409, 'Gift is already reserved'); // 409 Conflict
		}

		// Reserve the gift
		const reserved = await giftsQueries.reserve(
			locals.db,
			params.id,
			takenBy.trim(),
			hideReserverName || false
		);

		if (!reserved) {
			throw error(500, 'Failed to reserve gift');
		}

		// Return sanitized response
		return json({
			success: true,
			gift: {
				id: reserved.id,
				name: reserved.name,
				isTaken: reserved.isTaken,
				takenBy: reserved.hideReserverName ? null : reserved.takenBy,
				isAnonymous: reserved.hideReserverName
			},
			message: 'Gift reserved successfully'
		});
	} catch (err) {
		handleApiError(err, 'Failed to reserve gift', 'POST /api/gifts/[id]/reserve');
	}
};

// Public endpoint - allow unreservations (with some validation)
export const DELETE: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		// Get the name of who's trying to unreserve (for validation)
		const { takenBy } = (await request.json()) as { takenBy?: string };

		const existingGift = await giftsQueries.getById(locals.db, params.id);
		if (!existingGift) {
			throw error(404, 'Gift not found');
		}

		if (!existingGift.isTaken) {
			throw error(400, 'Gift is not currently reserved');
		}

		// Simple validation - allow unreservation if the name matches
		// or if no name validation is required (you might want to make this more strict)
		if (takenBy && existingGift.takenBy !== takenBy) {
			throw error(403, 'You can only unreserve gifts you reserved');
		}

		const unreserved = await giftsQueries.unreserve(locals.db, params.id);

		if (!unreserved) {
			throw error(500, 'Failed to unreserve gift');
		}

		return json({
			success: true,
			gift: {
				id: unreserved.id,
				name: unreserved.name,
				isTaken: unreserved.isTaken
			},
			message: 'Gift unreserved successfully'
		});
	} catch (err) {
		handleApiError(err, 'Failed to unreserve gift', 'DELETE /api/gifts/[id]/reserve');
	}
};
