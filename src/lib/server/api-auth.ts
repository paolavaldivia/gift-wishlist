import { error, type RequestEvent } from '@sveltejs/kit';
import { type AdminSession, AuthService } from './auth';

export interface ApiContext {
	session: AdminSession;
	userId: string;
	role: 'admin';
}

/**
 * Extract and validate admin session from request
 */
export function extractAdminSession(event: RequestEvent): AdminSession | null {
	// Try to get session from cookie (for browser requests)
	const cookieToken = event.cookies.get('admin_session');
	if (cookieToken) {
		const session = AuthService.verifyToken(cookieToken, event.platform);
		if (session) return session;
	}

	// Try to get session from Authorization header (for API requests)
	const authHeader = event.request.headers.get('Authorization');
	if (authHeader?.startsWith('Bearer ')) {
		const token = authHeader.substring(7);
		// Try both regular token and API token
		const session =
			AuthService.verifyToken(token, event.platform) ||
			AuthService.verifyApiToken(token, event.platform);
		if (session) return session;
	}

	return null;
}

/**
 * Require admin authentication for API endpoint
 */
export function requireAdmin(event: RequestEvent): ApiContext {
	const session = extractAdminSession(event);

	if (!session) {
		throw error(401, {
			message: 'Authentication required',
			code: 'UNAUTHORIZED'
		});
	}

	if (session.role !== 'admin') {
		throw error(403, {
			message: 'Admin access required',
			code: 'FORBIDDEN'
		});
	}

	return {
		session,
		userId: session.userId,
		role: session.role
	};
}

/**
 * Optional admin authentication (returns null if not authenticated)
 */
export function optionalAdmin(event: RequestEvent): ApiContext | null {
	const session = extractAdminSession(event);

	if (!session || session.role !== 'admin') {
		return null;
	}

	return {
		session,
		userId: session.userId,
		role: session.role
	};
}

/**
 * Create standardized API error responses
 */
export function createApiError(status: number, message: string, code?: string) {
	return error(status, {
		message,
		code: code || 'API_ERROR',
		timestamp: new Date().toISOString()
	});
}
