import type { Actions, PageServerLoad } from './$types';
import { giftRepository } from '$lib/server/db/gift-repository'; // NEW: Use repository
import { error, fail } from '@sveltejs/kit';
import { building } from '$app/environment';

export const load: PageServerLoad = async ({ locals }) => {
	// Check if db is available
	if (building) {
		return {
			gifts: []
		};
	}
	if (!locals.db) {
		console.error('Database not available');
		throw error(500, 'Database not available');
	}

	try {
		return {
			gifts: await giftRepository.findAll(locals.db)
		};
	} catch (err) {
		console.error('Failed to load gifts:', err);
		throw error(500, 'Failed to load gifts');
	}
};

export const actions: Actions = {
	reserveGift: async ({ request, locals }) => {
		if (!locals.db) {
			return fail(500, {
				success: false,
				message: 'Database not available'
			});
		}

		const formData = await request.formData();
		const giftId = formData.get('giftId')?.toString();
		const name = formData.get('name')?.toString();
		const hideReserverName = formData.get('hideReserverName') === 'true';

		if (!giftId || !name) {
			return fail(400, {
				success: false,
				message: 'Gift ID and name are required'
			});
		}

		try {
			// Check if gift is already taken
			const existingGift = await giftRepository.findById(locals.db, giftId);
			if (!existingGift) {
				return fail(404, {
					success: false,
					message: 'Gift not found'
				});
			}

			if (existingGift.isTaken) {
				return fail(400, {
					success: false,
					message: 'Gift is already taken'
				});
			}

			// Reserve the gift with privacy preference
			const reserved = await giftRepository.reserve(locals.db, giftId, name, hideReserverName);

			if (!reserved) {
				return fail(404, {
					success: false,
					message: 'Gift not found'
				});
			}

			return {
				success: true,
				gift: reserved,
				name,
				hideReserverName
			};
		} catch (err) {
			console.error('Failed to reserve gift:', err);
			return fail(500, {
				success: false,
				message: err instanceof Error ? err.message : 'Failed to reserve gift'
			});
		}
	}
};
