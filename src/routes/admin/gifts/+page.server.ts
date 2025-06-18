import { type Cookies, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { generateId, giftsQueries } from '$lib/server/db/queries';
import { currencies, type Currency, type Gift } from '$lib/types/gift';
import { AuthService } from '$lib/server/auth';

function isValidCurrency(currency: unknown): currency is Currency {
	return typeof currency === 'string' && currencies.includes(currency as Currency);
}

// Enhanced admin authentication check
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

export const load: PageServerLoad = async ({ cookies, locals }) => {
	// Validate admin authentication
	checkAdminAuth(cookies);

	try {
		const allGifts = (await giftsQueries.getAll(locals.db)) as Gift[];
		return { gifts: allGifts };
	} catch (error) {
		console.error('Error loading gifts:', error);
		return { gifts: [] };
	}
};

export const actions: Actions = {
	// Create a new gift
	createGift: async ({ request, cookies, locals }) => {
		checkAdminAuth(cookies);

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString();
		const imagePath = formData.get('imagePath')?.toString();
		const approximatePrice = parseFloat(formData.get('approximatePrice')?.toString() || '0');
		const rawCurrency = formData.get('currency')?.toString() || 'EUR';
		const currency = isValidCurrency(rawCurrency) ? rawCurrency : 'EUR';

		// Parse purchase links from form data
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

		// Validate required fields
		if (!name || !description || !imagePath) {
			return fail(400, { message: 'All required fields must be filled' });
		}

		try {
			// Create new gift using giftsQueries
			await giftsQueries.create(locals.db, {
				id: generateId(),
				name,
				description,
				imagePath,
				approximatePrice,
				currency,
				purchaseLinks,
				isTaken: false,
				takenBy: null,
				hideReserverName: false,
				createdAt: new Date(),
				updatedAt: new Date()
			});

			// Get all gifts to return updated list
			const allGifts = (await giftsQueries.getAll(locals.db)) as Gift[];

			return { gifts: allGifts };
		} catch (error) {
			console.error('Error creating gift:', error);
			return fail(500, { message: 'Failed to create gift' });
		}
	},

	// Update an existing gift
	updateGift: async ({ request, cookies, locals }) => {
		checkAdminAuth(cookies);

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString();
		const imagePath = formData.get('imagePath')?.toString();
		const approximatePrice = parseFloat(formData.get('approximatePrice')?.toString() || '0');
		const rawCurrency = formData.get('currency')?.toString() || 'EUR';
		const currency = isValidCurrency(rawCurrency) ? rawCurrency : 'EUR';

		// Parse purchase links from form data
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

		// Validate required fields
		if (!id || !name || !description || !imagePath) {
			return fail(400, { message: 'All required fields must be filled' });
		}

		try {
			// Update gift using giftsQueries
			await giftsQueries.update(locals.db, id, {
				name,
				description,
				imagePath,
				approximatePrice,
				currency,
				purchaseLinks,
				updatedAt: new Date()
			});

			// Get all gifts to return updated list
			const allGifts = (await giftsQueries.getAll(locals.db)) as Gift[];

			return { gifts: allGifts };
		} catch (error) {
			console.error('Error updating gift:', error);
			return fail(500, { message: 'Failed to update gift' });
		}
	},

	// Delete a gift
	deleteGift: async ({ request, cookies, locals }) => {
		checkAdminAuth(cookies);

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { message: 'Gift ID is required' });
		}

		try {
			// Delete gift using giftsQueries
			await giftsQueries.delete(locals.db, id);

			// Get all gifts to return updated list
			const allGifts = (await giftsQueries.getAll(locals.db)) as Gift[];

			return { gifts: allGifts };
		} catch (error) {
			console.error('Error deleting gift:', error);
			return fail(500, { message: 'Failed to delete gift' });
		}
	},

	// Unreserve a gift
	unreserveGift: async ({ request, cookies, locals }) => {
		checkAdminAuth(cookies);

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { message: 'Gift ID is required' });
		}

		try {
			// Unreserve gift using giftsQueries
			await giftsQueries.unreserve(locals.db, id);

			// Get all gifts to return updated list
			const allGifts = (await giftsQueries.getAll(locals.db)) as Gift[];

			return { gifts: allGifts };
		} catch (error) {
			console.error('Error unreserving gift:', error);
			return fail(500, { message: 'Failed to unreserve gift' });
		}
	}
};
