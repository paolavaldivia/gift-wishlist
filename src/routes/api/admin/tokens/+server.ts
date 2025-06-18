import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/api-auth';
import { AuthService } from '$lib/server/auth';

export const prerender = false;

export const POST: RequestHandler = async (event) => {
	const adminContext = requireAdmin(event);

	try {
		const apiToken = AuthService.generateApiToken(event.platform);

		return json({
			token: apiToken,
			type: 'Bearer',
			expiresIn: '30d',
			generatedBy: adminContext.userId,
			timestamp: new Date().toISOString(),
			usage: 'Include in Authorization header as "Bearer <token>"'
		});
	} catch (error) {
		console.error('Failed to generate API token:', error);
		return json({ error: 'Failed to generate token' }, { status: 500 });
	}
};
