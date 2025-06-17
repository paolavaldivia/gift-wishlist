import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ADMIN_PASSWORD_HASH } from '$env/static/private';
import * as bcrypt from 'bcryptjs';

export const load: PageServerLoad = async ({ cookies }) => {
	// Check if user is already authenticated using the session token
	const sessionToken = cookies.get('admin_session');
	const isAuthenticated = sessionToken === 'true';

	if (isAuthenticated) {
		redirect(302, '/admin/gifts');
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
		// Compare with hashed password using bcrypt
		const isPasswordValid = await bcrypt.compare(password.toString(), ADMIN_PASSWORD_HASH);

		if (!isPasswordValid) {
			return fail(400, { message: 'Invalid password' });
		}

		// Generate a secure random token
		const sessionToken = 'true';

		// Set authentication cookie with the secure token
		cookies.set('admin_session', sessionToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 // 1 day
		});

		redirect(303, '/admin/gifts');
	}
} satisfies Actions;
