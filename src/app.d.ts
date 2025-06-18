import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type * as schema from '$lib/server/db/schema';

declare global {
	namespace App {
		interface Platform {
			env: Env;
			cf: CfProperties;
			ctx: ExecutionContext;
		}

		interface Locals {
			db: DrizzleD1Database<typeof schema> | BetterSQLite3Database<typeof schema>;
		}
	}
}

// Define your Cloudflare environment interface
interface Env {
	DB: D1Database;
	JWT_SECRET: string;
	ADMIN_PASSWORD_HASH: string;
}

export {};
