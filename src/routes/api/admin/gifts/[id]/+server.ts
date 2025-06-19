import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { giftRepository } from '$lib/server/db/gift-repository.js';
import { handleApiError } from '$lib/server/utils';
import { requireAdmin } from '$lib/server/api-auth.js';
import type { Currency } from '$lib/types/gift';

export const prerender = false;

export const GET: RequestHandler = async (event) => {
	const adminContext = requireAdmin(event);

	const { locals, params } = event;

	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const gift = await giftRepository.findByIdAdmin(locals.db, params.id);

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

export const PUT: RequestHandler = async (event) => {
	const adminContext = requireAdmin(event);

	const { locals, params, request } = event;

	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const updates = (await request.json()) as {
			name?: string;
			description?: string;
			imagePath?: string;
			approximatePrice?: number;
			currency?: Currency;
			purchaseLinks?: Array<{ siteName: string; url: string }>;
			isTaken?: boolean;
			takenBy?: string | null;
			hideReserverName?: boolean;
		};

		if (updates.name !== undefined && (!updates.name || updates.name.trim().length === 0)) {
			throw error(400, 'Name cannot be empty');
		}

		if (updates.approximatePrice !== undefined && updates.approximatePrice <= 0) {
			throw error(400, 'Price must be greater than 0');
		}

		const updated = await giftRepository.updateAdmin(locals.db, params.id, updates);

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
		// Check if gift exists first
		const existingGift = await giftRepository.findByIdAdmin(locals.db, params.id);
		if (!existingGift) {
			throw error(404, 'Gift not found');
		}

		await giftRepository.delete(locals.db, params.id);

		return json({
			success: true,
			deletedGift: {
				id: existingGift.id,
				name: existingGift.name
			},
			deletedBy: adminContext.userId,
			timestamp: new Date().toISOString()
		});
	} catch (err) {
		handleApiError(err, 'Failed to delete gift', 'DELETE /api/admin/gifts/[id]');
	}
};

export const PATCH: RequestHandler = async (event) => {
	const adminContext = requireAdmin(event);

	const { locals, params, request } = event;

	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const requestBody = (await request.json()) as {
			action: string;
		};

		const { action } = requestBody;

		if (action === 'unreserve') {
			const existingGift = await giftRepository.findByIdAdmin(locals.db, params.id);
			if (!existingGift) {
				throw error(404, 'Gift not found');
			}

			if (!existingGift.isTaken) {
				throw error(400, 'Gift is not currently reserved');
			}

			const unreserved = await giftRepository.unreserve(locals.db, params.id);

			if (!unreserved) {
				throw error(500, 'Failed to unreserve gift');
			}

			return json({
				success: true,
				gift: unreserved,
				message: `Successfully unreserved "${unreserved.name}"`,
				unreservedBy: adminContext.userId,
				timestamp: new Date().toISOString()
			});
		} else {
			throw error(400, 'Invalid action. Only "unreserve" is supported.');
		}
	} catch (err) {
		handleApiError(err, 'Failed to perform action on gift', 'PATCH /api/admin/gifts/[id]');
	}
};
