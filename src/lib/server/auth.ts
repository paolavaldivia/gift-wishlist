import jwt from 'jsonwebtoken';
import { ADMIN_PASSWORD_HASH, JWT_SECRET } from '$env/static/private';

export interface AdminSession {
	userId: string;
	role: 'admin';
	iat: number;
	exp: number;
}

export class AuthService {
	private static readonly TOKEN_EXPIRY = '24h';
	private static readonly API_TOKEN_EXPIRY = '30d';
	private static readonly COOKIE_NAME = 'admin_session';

	/**
	 * Get JWT secret - works in both local and Cloudflare environments
	 */
	private static getJwtSecret(platform?: App.Platform): string {
		// In Cloudflare environment, use platform.env
		if (platform?.env?.JWT_SECRET) {
			return platform.env.JWT_SECRET;
		}

		// In local development, use SvelteKit's env imports
		if (JWT_SECRET) {
			return JWT_SECRET;
		}

		throw new Error('JWT_SECRET environment variable is not set');
	}

	/**
	 * Get admin password hash - works in both local and Cloudflare environments
	 */
	static getPasswordHash(platform?: App.Platform): string {
		// In Cloudflare environment, use platform.env
		if (platform?.env?.ADMIN_PASSWORD_HASH) {
			return platform.env.ADMIN_PASSWORD_HASH;
		}

		// In local development, use SvelteKit's env imports
		if (ADMIN_PASSWORD_HASH) {
			return ADMIN_PASSWORD_HASH;
		}

		throw new Error('ADMIN_PASSWORD_HASH environment variable is not set');
	}

	/**
	 * Generate a secure JWT token for admin session
	 */
	static generateToken(platform?: App.Platform): string {
		const jwtSecret = this.getJwtSecret(platform);

		const payload = {
			userId: 'admin',
			role: 'admin' as const,
			iat: Math.floor(Date.now() / 1000)
		};

		return jwt.sign(payload, jwtSecret, {
			expiresIn: this.TOKEN_EXPIRY,
			issuer: 'gift-registry-admin',
			subject: 'admin-session'
		});
	}

	/**
	 * Verify and decode JWT token
	 */
	static verifyToken(token: string, platform?: App.Platform): AdminSession | null {
		try {
			const jwtSecret = this.getJwtSecret(platform);

			const decoded = jwt.verify(token, jwtSecret, {
				issuer: 'gift-registry-admin',
				subject: 'admin-session'
			}) as AdminSession;

			return decoded;
		} catch (error) {
			// Token is invalid, expired, or tampered with
			console.warn(
				'Invalid admin token:',
				error instanceof Error ? error.message : 'Unknown error'
			);
			return null;
		}
	}

	/**
	 * Generate API token for external integrations
	 */
	static generateApiToken(platform?: App.Platform): string {
		const jwtSecret = this.getJwtSecret(platform);

		const payload = {
			userId: 'admin',
			role: 'admin' as const,
			type: 'api_token',
			iat: Math.floor(Date.now() / 1000)
		};

		return jwt.sign(payload, jwtSecret, {
			expiresIn: this.API_TOKEN_EXPIRY,
			issuer: 'gift-registry-admin',
			subject: 'api-session'
		});
	}

	/**
	 * Verify API token
	 */
	static verifyApiToken(token: string, platform?: App.Platform): AdminSession | null {
		try {
			const jwtSecret = this.getJwtSecret(platform);

			const decoded = jwt.verify(token, jwtSecret, {
				issuer: 'gift-registry-admin',
				subject: 'api-session'
			}) as AdminSession;

			return decoded;
		} catch (error) {
			console.warn('Invalid API token:', error instanceof Error ? error.message : 'Unknown error');
			return null;
		}
	}

	/**
	 * Generate secure cookie options
	 */
	static getCookieOptions() {
		return {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // HTTPS only in production
			sameSite: 'strict' as const,
			maxAge: 60 * 60 * 24 // 24 hours in seconds
		};
	}

	/**
	 * Clear the admin session cookie
	 */
	static clearCookieOptions() {
		return {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict' as const,
			maxAge: 0 // Expire immediately
		};
	}
}
