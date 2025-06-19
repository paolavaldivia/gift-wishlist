import { type Cookies, error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AuthService } from '$lib/server/auth.js';
import { currencies, type Currency } from '$lib/types/gift';
import { giftRepository } from '$lib/server/db/gift-repository';

function checkAdminAuth(cookies: Cookies): void {
	const sessionToken = cookies.get('admin_session');

	if (!sessionToken) {
		throw redirect(302, '/admin');
	}

	const session = AuthService.verifyToken(sessionToken);

	if (!session || session.role !== 'admin') {
		// Clear invalid token
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
		const gifts = await giftRepository.findAllAdmin(locals.db);

		return {
			gifts,
			stats: {
				total: gifts.length,
				available: gifts.filter((g) => !g.isTaken).length,
				taken: gifts.filter((g) => g.isTaken).length
			}
		};
	} catch (err) {
		console.error('Error loading admin gifts:', err);
		throw error(500, 'Failed to load gifts');
	}
};

export const actions: Actions = {
	createGift: async ({ request, cookies, locals }) => {
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
			const approximatePrice = parseFloat(formData.get('approximatePrice')?.toString() || '0');
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

			if (approximatePrice <= 0) {
				return fail(400, {
					success: false,
					message: 'Price must be greater than 0'
				});
			}

			const giftData = {
				name,
				description,
				imagePath,
				approximatePrice,
				currency,
				purchaseLinks,
				isTaken: false,
				takenBy: null,
				hideReserverName: false
			};

			const createdGift = await giftRepository.createAdmin(locals.db, giftData);

			return {
				success: true,
				gift: createdGift,
				message: `Gift "${createdGift.name}" created successfully`
			};
		} catch (err) {
			console.error('Failed to create gift:', err);
			return fail(500, {
				success: false,
				message: 'Failed to create gift'
			});
		}
	},

	updateGift: async ({ request, cookies, locals }) => {
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
			const approximatePrice = parseFloat(formData.get('approximatePrice')?.toString() || '0');
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
					message: 'Gift ID is required'
				});
			}

			if (!name || !description || !imagePath) {
				return fail(400, {
					success: false,
					message: 'Name, description, and image path are required'
				});
			}

			const updateData = {
				name,
				description,
				imagePath,
				approximatePrice,
				currency,
				purchaseLinks
			};

			const updatedGift = await giftRepository.updateAdmin(locals.db, id, updateData);

			if (!updatedGift) {
				return fail(404, {
					success: false,
					message: 'Gift not found'
				});
			}

			return {
				success: true,
				gift: updatedGift,
				message: `Gift "${updatedGift.name}" updated successfully`
			};
		} catch (err) {
			console.error('Failed to update gift:', err);
			return fail(500, {
				success: false,
				message: 'Failed to update gift'
			});
		}
	},

	deleteGift: async ({ request, cookies, locals }) => {
		checkAdminAuth(cookies);

		if (!locals.db) {
			return fail(500, {
				success: false,
				message: 'Database not available'
			});
		}

		try {
			const formData = await request.formData();
			const giftId = formData.get('id')?.toString();

			if (!giftId) {
				return fail(400, {
					success: false,
					message: 'Gift ID is required'
				});
			}

			const existingGift = await giftRepository.findByIdAdmin(locals.db, giftId);
			if (!existingGift) {
				return fail(404, {
					success: false,
					message: 'Gift not found'
				});
			}

			await giftRepository.delete(locals.db, giftId);

			return {
				success: true,
				message: `Gift "${existingGift.name}" deleted successfully`
			};
		} catch (err) {
			console.error('Failed to delete gift:', err);
			return fail(500, {
				success: false,
				message: 'Failed to delete gift'
			});
		}
	},

	unreserveGift: async ({ request, cookies, locals }) => {
		checkAdminAuth(cookies);

		if (!locals.db) {
			return fail(500, {
				success: false,
				message: 'Database not available'
			});
		}

		try {
			const formData = await request.formData();
			const giftId = formData.get('id')?.toString();

			if (!giftId) {
				return fail(400, {
					success: false,
					message: 'Gift ID is required'
				});
			}

			const unreservedGift = await giftRepository.unreserve(locals.db, giftId);

			if (!unreservedGift) {
				return fail(404, {
					success: false,
					message: 'Gift not found'
				});
			}

			return {
				success: true,
				gift: unreservedGift,
				message: `Gift "${unreservedGift.name}" unreserved successfully`
			};
		} catch (err) {
			console.error('Failed to unreserve gift:', err);
			return fail(500, {
				success: false,
				message: 'Failed to unreserve gift'
			});
		}
	}
};
