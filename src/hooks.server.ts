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

	// Check if we're in the Cloudflare environment
	if (process.env.NODE_ENV === 'production' && event.platform?.env?.DB) {
		// For production/preview with D1
		event.locals.db = getDb(event.platform.env);
	} else {
		// For local development, you might want to use a different approach
		// Since we can't use D1 bindings locally
		event.locals.db = await createDbClient();
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
