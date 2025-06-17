import type { LayoutServerLoad } from './$types';

export const prerender = false;

export const load: LayoutServerLoad = async ({ url, cookies }) => {
	const isAuthenticated = cookies.get('admin_session') === 'true';
	const isLoginPage = url.pathname === '/admin';

	return {
		isAuthenticated,
		isLoginPage
	};
};
