import type { Actions, PageServerLoad } from './$types';
import { giftRepository } from '$lib/server/db/gift-repository'; // NEW: Use repository
import { error, fail } from '@sveltejs/kit';
import { building } from '$app/environment';
import { bigGiftRepository } from '$lib/server/db/big-gift-repository';

export const load: PageServerLoad = async ({ locals }) => {
	if (building) {
		return {
			gifts: [],
			bigGifts: []
		};
	}
	if (!locals.db) {
		console.error('Database not available');
		throw error(500, 'Database not available');
	}

	try {
		const [gifts, bigGifts] = await Promise.all([
			giftRepository.findAll(locals.db),
			bigGiftRepository.findAllWithContributors(locals.db)
		]);

		// Randomize the order of gifts and bigGifts
		const shuffledGifts = [...gifts].sort(() => Math.random() - 0.5);
		const shuffledBigGifts = [...bigGifts].sort(() => Math.random() - 0.5);

		return {
			gifts: shuffledGifts,
			bigGifts: shuffledBigGifts
		};
	} catch (err) {
		console.error('Failed to load gifts:', err);
		throw error(500, 'Failed to load gifts');
	}
};

export const actions = {
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
	},
	donateBigGift: async ({ request, locals }) => {
		if (!locals.db) {
			return fail(500, {
				success: false,
				message: 'Database not available'
			});
		}

		const formData = await request.formData();
		const bigGiftId = formData.get('bigGiftId')?.toString();
		const amount = parseFloat(formData.get('amount')?.toString() || '0');
		const name = formData.get('name')?.toString();
		const email = formData.get('email')?.toString();
		const message = formData.get('message')?.toString();
		const hideContributorName = formData.get('hideContributorName') === 'true';

		if (!bigGiftId || !amount || !name) {
			return fail(400, {
				success: false,
				message: 'Big gift ID, amount, and name are required'
			});
		}

		try {
			// Check if big gift exists
			const existingBigGift = await bigGiftRepository.findById(locals.db, bigGiftId);
			if (!existingBigGift) {
				return fail(404, {
					success: false,
					message: 'Big gift not found'
				});
			}

			// Add contribution
			const updatedBigGift = await bigGiftRepository.addContribution(locals.db, {
				bigGiftId,
				name,
				amount,
				email,
				message,
				hideContributorName,
				createdAt: new Date()
			});

			if (!updatedBigGift) {
				return fail(500, {
					success: false,
					message: 'Failed to add contribution'
				});
			}

			// Make sure we're returning the most up-to-date data
			// Fetch all big gifts again to ensure the page data is refreshed
			const [gifts, bigGifts] = await Promise.all([
				giftRepository.findAll(locals.db),
				bigGiftRepository.findAllWithContributors(locals.db)
			]);

			return {
				success: true,
				bigGift: updatedBigGift,
				name,
				amount,
				email,
				message,
				hideContributorName,
				// Include updated data for the page
				data: {
					gifts,
					bigGifts
				}
			};
		} catch (err) {
			console.error('Failed to add contribution:', err);
			return fail(500, {
				success: false,
				message: err instanceof Error ? err.message : 'Failed to add contribution'
			});
		}
	}
} satisfies Actions;
