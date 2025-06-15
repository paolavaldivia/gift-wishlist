import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { giftsQueries } from '$lib/server/db/queries';
import type { Gift } from '$lib/types/gift';
import { handleApiError } from '$lib/server/utils';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const gift = await giftsQueries.getById(locals.db, params.id);

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

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const updates = (await request.json()) as Partial<Gift>;
		const updated = await giftsQueries.update(locals.db, params.id, updates);

		if (!updated) {
			throw error(404, 'Gift not found');
		}

		return json(updated);
	} catch (err) {
		handleApiError(err, 'Failed to update gift', 'PUT /api/gifts/[id]');
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		await giftsQueries.delete(locals.db, params.id);
		return new Response(null, { status: 204 });
	} catch (err) {
		handleApiError(err, 'Failed to delete gift', 'DELETE /api/gifts/[id]');
	}
};
