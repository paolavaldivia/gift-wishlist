import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AuthService } from '$lib/server/auth';

export const prerender = false;

export const POST: RequestHandler = async ({ cookies }) => {
	// Clear the admin authentication cookie securely
	cookies.delete('admin_session', AuthService.clearCookieOptions());

	return json({ success: true });
};
