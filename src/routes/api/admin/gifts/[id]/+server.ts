import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { giftsQueries } from '$lib/server/db/queries';
import { handleApiError } from '$lib/server/utils';
import { requireAdmin } from '$lib/server/api-auth';
import type { NewGift } from '$lib/server/db/schema';

export const prerender = false;

// Admin-only endpoint to get gift details
export const GET: RequestHandler = async (event) => {
	const adminContext = requireAdmin(event);

	const { locals, params } = event;

	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const gift = await giftsQueries.getById(locals.db, params.id);

		if (!gift) {
			throw error(404, 'Gift not found');
		}

		return json({
			gift,
			requestedBy: adminContext.userId,
			timestamp: new Date().toISOString()
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err && err.status === 404) throw err;
		console.error('Failed to fetch gift:', err);
		throw error(500, 'Failed to fetch gift');
	}
};

// Admin-only endpoint to update gifts
export const PUT: RequestHandler = async (event) => {
	const adminContext = requireAdmin(event);

	const { locals, params, request } = event;

	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const updates = (await request.json()) as Partial<NewGift>;
		const updated = await giftsQueries.update(locals.db, params.id, updates);

		if (!updated) {
			throw error(404, 'Gift not found');
		}

		return json({
			gift: updated,
			updatedBy: adminContext.userId,
			timestamp: new Date().toISOString()
		});
	} catch (err) {
		handleApiError(err, 'Failed to update gift', 'PUT /api/admin/gifts/[id]');
	}
};

// Admin-only endpoint to delete gifts
export const DELETE: RequestHandler = async (event) => {
	const adminContext = requireAdmin(event);

	const { locals, params } = event;

	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		await giftsQueries.delete(locals.db, params.id);

		return json({
			success: true,
			deletedBy: adminContext.userId,
			timestamp: new Date().toISOString()
		});
	} catch (err) {
		handleApiError(err, 'Failed to delete gift', 'DELETE /api/admin/gifts/[id]');
	}
};
