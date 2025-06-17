// src/routes/admin/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { AuthService } from '$lib/server/auth';

export const prerender = false;

export const load: LayoutServerLoad = async ({ url, cookies }) => {
	const isLoginPage = url.pathname === '/admin';
	let isAuthenticated = false;
	let session = null;

	// Check for valid session token
	const sessionToken = cookies.get('admin_session');
	if (sessionToken) {
		session = AuthService.verifyToken(sessionToken);
		isAuthenticated = session !== null;

		// If token is invalid/expired, clear the cookie
		if (!session) {
			cookies.delete('admin_session', AuthService.clearCookieOptions());
		}
	}

	return {
		isAuthenticated,
		isLoginPage,
		session: session ? { userId: session.userId, role: session.role } : null
	};
};
