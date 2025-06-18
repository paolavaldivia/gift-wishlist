import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = async () => {
	return json({
		name: 'Gift Registry API',
		version: '1.0.0',
		description: 'Public API for the gift registry application',
		endpoints: {
			public: {
				'GET /api/gifts': 'List all gifts (public view)',
				'GET /api/gifts?filter=available': 'List available gifts',
				'GET /api/gifts?filter=taken': 'List reserved gifts',
				'GET /api/gifts/[id]': 'Get specific gift details',
				'POST /api/gifts/[id]/reserve': 'Reserve a gift',
				'DELETE /api/gifts/[id]/reserve': 'Unreserve a gift'
			},
			admin: {
				'GET /api/admin/gifts': 'List all gifts (admin view)',
				'POST /api/admin/gifts': 'Create new gift',
				'GET /api/admin/gifts/[id]': 'Get gift (admin view)',
				'PUT /api/admin/gifts/[id]': 'Update gift',
				'DELETE /api/admin/gifts/[id]': 'Delete gift',
				'GET /api/admin/seed': 'Seed database',
				'POST /api/admin/tokens': 'Generate API tokens'
			}
		},
		authentication: {
			public: 'No authentication required',
			admin: 'Requires admin session cookie or Bearer token'
		}
	});
};
