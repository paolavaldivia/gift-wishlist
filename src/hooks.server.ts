import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getDb } from '$lib/server/db';
import { createDbClient } from '$lib/server/db/config';
import { building } from '$app/environment';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

const handleDb: Handle = async ({ event, resolve }) => {
	// Skip DB initialization during build/prerendering
	if (building) {
		return resolve(event);
	}

	try {
		// Check if we're in the Cloudflare environment with D1 binding
		if (process.env.NODE_ENV === 'development') {
			event.locals.db = await createDbClient();
		} else if (event.platform?.env?.DB) {
			event.locals.db = getDb(event.platform.env);
		} else {
			// Production without D1 binding - this shouldn't happen
			console.error('No database binding available in production environment');
			// Don't set event.locals.db - let the endpoints handle the missing database
		}
	} catch (error) {
		console.error('Failed to initialize database connection:', error);
		// Don't set event.locals.db - let the endpoints handle the missing database
	}

	return resolve(event);
};

// Compose multiple handles using the sequence pattern
export const handle: Handle = async ({ event, resolve }) => {
	// First apply paraglide middleware
	return handleParaglide({
		event,
		resolve: async (innerEvent) => {
			// Then apply database middleware
			return handleDb({
				event: innerEvent,
				resolve
			});
		}
	});
};
