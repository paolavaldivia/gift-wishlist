import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const prerender = false;

export const POST: RequestHandler = async ({ cookies }) => {
	// Clear the admin authentication cookie
	cookies.delete('admin_session', { path: '/' });

	return json({ success: true });
};
