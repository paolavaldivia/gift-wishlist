import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import type { Contributor } from '$lib/types/gift';
import { bigGiftRepository } from '$lib/server/db/big-gift-repository';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.db) {
		throw error(500, 'Database not available');
	}

	try {
		const contributionData = (await request.json()) as Omit<Contributor, 'id' | 'bigGiftId'>;

		const newContribution = {
			bigGiftId: params.id,
			...contributionData
		};

		const created = await bigGiftRepository.addContribution(locals.db, newContribution);
		return json(created, { status: 201 });
	} catch (err) {
		console.error('Failed to add contribution:', err);
		throw error(500, 'Failed to add contribution');
	}
};
