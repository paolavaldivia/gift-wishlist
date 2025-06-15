import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { giftsQueries } from '$lib/server/db/queries';
import type { Gift } from '$lib/types/gift';
import { handleApiError } from '$lib/server/utils';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const { takenBy } = (await request.json()) as Gift;

		if (!takenBy) {
			throw error(400, 'takenBy is required');
		}

		const reserved = await giftsQueries.reserve(locals.db, params.id, takenBy);

		if (!reserved) {
			throw error(404, 'Gift not found');
		}

		return json(reserved);
	} catch (err) {
		handleApiError(err, 'Failed to reserve gift', 'Reserve gift');
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const unreserved = await giftsQueries.unreserve(locals.db, params.id);

		if (!unreserved) {
			throw error(404, 'Gift not found');
		}

		return json(unreserved);
	} catch (err) {
		handleApiError(err, 'Failed to unreserve gift', 'Unreserve gift');
	}
};
