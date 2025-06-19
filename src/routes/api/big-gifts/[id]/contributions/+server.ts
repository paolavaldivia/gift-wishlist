import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { bigGiftsQueries, generateId } from '$lib/server/db/gift-repository';
import type { Contributor } from '$lib/types/gift';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const contributionData = (await request.json()) as Omit<Contributor, 'id' | 'bigGiftId'>;

		const newContribution = {
			id: generateId(),
			bigGiftId: params.id,
			...contributionData,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const created = await bigGiftsQueries.addContribution(locals.db, newContribution);
		return json(created, { status: 201 });
	} catch (err) {
		console.error('Failed to add contribution:', err);
		throw error(500, 'Failed to add contribution');
	}
};
