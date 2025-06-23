import { type Cookies, error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AuthService } from '$lib/server/auth.js';
import { currencies, type Currency } from '$lib/types/gift';
import { bigGiftRepository } from '$lib/server/db/big-gift-repository';

function checkAdminAuth(cookies: Cookies): void {
	const sessionToken = cookies.get('admin_session');

	if (!sessionToken) {
		throw redirect(302, '/admin');
	}

	const session = AuthService.verifyToken(sessionToken);

	if (!session || session.role !== 'admin') {
		cookies.delete('admin_session', AuthService.clearCookieOptions());
		throw redirect(302, '/admin');
	}
}

function isValidCurrency(currency: unknown): currency is Currency {
	return typeof currency === 'string' && currencies.includes(currency as Currency);
}

export const load: PageServerLoad = async ({ cookies, locals }) => {
	checkAdminAuth(cookies);

	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const bigGifts = await bigGiftRepository.findAllWithContributors(locals.db);

		return {
			bigGifts,
			stats: {
				total: bigGifts.length,
				fullyFunded: bigGifts.filter((g) => g.currentAmount >= g.targetAmount).length,
				partiallyFunded: bigGifts.filter(
					(g) => g.currentAmount > 0 && g.currentAmount < g.targetAmount
				).length,
				notFunded: bigGifts.filter((g) => g.currentAmount === 0).length,
				totalTargetAmount: bigGifts.reduce((sum, g) => sum + g.targetAmount, 0),
				totalCurrentAmount: bigGifts.reduce((sum, g) => sum + g.currentAmount, 0)
			}
		};
	} catch (err) {
		console.error('Error loading admin big gifts:', err);
		throw error(500, 'Failed to load big gifts');
	}
};

export const actions: Actions = {
	createBigGift: async ({ request, cookies, locals }) => {
		checkAdminAuth(cookies);

		if (!locals.db) {
			return fail(500, {
				success: false,
				message: 'Database not available'
			});
		}

		try {
			const formData = await request.formData();

			const name = formData.get('name')?.toString();
			const description = formData.get('description')?.toString();
			const imagePath = formData.get('imagePath')?.toString();
			const targetAmount = parseFloat(formData.get('targetAmount')?.toString() || '0');
			const rawCurrency = formData.get('currency')?.toString() || 'EUR';
			const currency = isValidCurrency(rawCurrency) ? rawCurrency : 'EUR';

			const purchaseLinks = [];
			const formEntries = [...formData.entries()];

			for (let i = 0; i < formEntries.length; i++) {
				const [key, value] = formEntries[i];
				if (key.startsWith('purchaseLinks[') && key.endsWith('].siteName')) {
					const index = key.match(/\[(\d+)]/)?.[1];
					if (index) {
						const urlKey = `purchaseLinks[${index}].url`;
						const url = formData.get(urlKey)?.toString();
						if (url) {
							purchaseLinks.push({
								siteName: value.toString(),
								url
							});
						}
					}
				}
			}

			// Basic validation
			if (!name || !description || !imagePath) {
				return fail(400, {
					success: false,
					message: 'Name, description, and image path are required'
				});
			}

			if (targetAmount <= 0) {
				return fail(400, {
					success: false,
					message: 'Target amount must be greater than 0'
				});
			}

			const bigGiftData = {
				name,
				description,
				imagePath,
				targetAmount,
				currency,
				purchaseLinks
			};

			const createdBigGift = await bigGiftRepository.createAdmin(locals.db, bigGiftData);

			return {
				success: true,
				bigGift: createdBigGift,
				message: `Big gift "${createdBigGift.name}" created successfully`
			};
		} catch (err) {
			console.error('Failed to create big gift:', err);
			return fail(500, {
				success: false,
				message: 'Failed to create big gift'
			});
		}
	},

	updateBigGift: async ({ request, cookies, locals }) => {
		checkAdminAuth(cookies);

		if (!locals.db) {
			return fail(500, {
				success: false,
				message: 'Database not available'
			});
		}

		try {
			const formData = await request.formData();
			const id = formData.get('id')?.toString();
			const name = formData.get('name')?.toString();
			const description = formData.get('description')?.toString();
			const imagePath = formData.get('imagePath')?.toString();
			const targetAmount = parseFloat(formData.get('targetAmount')?.toString() || '0');
			const rawCurrency = formData.get('currency')?.toString() || 'EUR';
			const currency = isValidCurrency(rawCurrency) ? rawCurrency : 'EUR';

			const purchaseLinks = [];
			const formEntries = [...formData.entries()];

			for (let i = 0; i < formEntries.length; i++) {
				const [key, value] = formEntries[i];
				if (key.startsWith('purchaseLinks[') && key.endsWith('].siteName')) {
					const index = key.match(/\[(\d+)]/)?.[1];
					if (index) {
						const urlKey = `purchaseLinks[${index}].url`;
						const url = formData.get(urlKey)?.toString();
						if (url) {
							purchaseLinks.push({
								siteName: value.toString(),
								url
							});
						}
					}
				}
			}

			if (!id) {
				return fail(400, {
					success: false,
					message: 'Big gift ID is required'
				});
			}

			if (!name || !description || !imagePath) {
				return fail(400, {
					success: false,
					message: 'Name, description, and image path are required'
				});
			}

			if (targetAmount <= 0) {
				return fail(400, {
					success: false,
					message: 'Target amount must be greater than 0'
				});
			}

			const updateData = {
				name,
				description,
				imagePath,
				targetAmount,
				currency,
				purchaseLinks
			};

			const updatedBigGift = await bigGiftRepository.updateAdmin(locals.db, id, updateData);

			if (!updatedBigGift) {
				return fail(404, {
					success: false,
					message: 'Big gift not found'
				});
			}

			return {
				success: true,
				bigGift: updatedBigGift,
				message: `Big gift "${updatedBigGift.name}" updated successfully`
			};
		} catch (err) {
			console.error('Failed to update big gift:', err);
			return fail(500, {
				success: false,
				message: 'Failed to update big gift'
			});
		}
	},

	deleteBigGift: async ({ request, cookies, locals }) => {
		checkAdminAuth(cookies);

		if (!locals.db) {
			return fail(500, {
				success: false,
				message: 'Database not available'
			});
		}

		try {
			const formData = await request.formData();
			const bigGiftId = formData.get('id')?.toString();

			if (!bigGiftId) {
				return fail(400, {
					success: false,
					message: 'Big gift ID is required'
				});
			}

			const existingBigGift = await bigGiftRepository.findByIdWithContributors(
				locals.db,
				bigGiftId
			);
			if (!existingBigGift) {
				return fail(404, {
					success: false,
					message: 'Big gift not found'
				});
			}

			// Check if there are contributions before deletion
			if (existingBigGift.contributors.length > 0) {
				return fail(400, {
					success: false,
					message: 'Cannot delete big gift with existing contributions. Consider archiving instead.'
				});
			}

			await bigGiftRepository.delete(locals.db, bigGiftId);

			return {
				success: true,
				message: `Big gift "${existingBigGift.name}" deleted successfully`
			};
		} catch (err) {
			console.error('Failed to delete big gift:', err);
			return fail(500, {
				success: false,
				message: 'Failed to delete big gift'
			});
		}
	}
};
