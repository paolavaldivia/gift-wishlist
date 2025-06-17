// src/routes/admin/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ADMIN_PASSWORD_HASH } from '$env/static/private';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '$lib/server/auth';

export const load: PageServerLoad = async ({ cookies }) => {
	// Check if user is already authenticated using the JWT token
	const sessionToken = cookies.get('admin_session');

	if (sessionToken) {
		const session = AuthService.verifyToken(sessionToken);
		if (session) {
			redirect(302, '/admin/gifts');
		}
	}

	return {};
};

export const actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const password = data.get('password');

		if (!password) {
			return fail(400, { message: 'Password is required' });
		}

		// Verify password against hashed version
		const isPasswordValid = await bcrypt.compare(password.toString(), ADMIN_PASSWORD_HASH);

		if (!isPasswordValid) {
			return fail(400, { message: 'Invalid password' });
		}

		// Generate secure JWT token
		const token = AuthService.generateToken();

		// Set secure authentication cookie
		cookies.set('admin_session', token, AuthService.getCookieOptions());

		redirect(303, '/admin/gifts');
	}
} satisfies Actions;
