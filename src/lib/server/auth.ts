// src/lib/server/auth.ts
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

export interface AdminSession {
	userId: string;
	role: 'admin';
	iat: number;
	exp: number;
}

export class AuthService {
	private static readonly TOKEN_EXPIRY = '24h';
	private static readonly COOKIE_NAME = 'admin_session';

	/**
	 * Generate a secure JWT token for admin session
	 */
	static generateToken(): string {
		const payload = {
			userId: 'admin',
			role: 'admin' as const,
			iat: Math.floor(Date.now() / 1000)
		};

		return jwt.sign(payload, JWT_SECRET, {
			expiresIn: this.TOKEN_EXPIRY,
			issuer: 'gift-registry-admin',
			subject: 'admin-session'
		});
	}

	/**
	 * Verify and decode JWT token
	 */
	static verifyToken(token: string): AdminSession | null {
		try {
			const decoded = jwt.verify(token, JWT_SECRET, {
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
