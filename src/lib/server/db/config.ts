// db/config.ts
import 'dotenv/config';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import Database from 'better-sqlite3';
import * as schema from './schema';

async function getDrizzleConfig() {
	const env = process.env.NODE_ENV || 'development';

	if (env === 'production') {
		// In production, we don't need to load config files
		// D1 is accessed directly via the platform binding
		return {
			type: 'd1'
		};
	} else {
		try {
			const { default: devConfig } = await import('../../../../drizzle-dev.config');
			return {
				type: 'sqlite',
				credentials: devConfig.dbCredentials
			};
		} catch (err) {
			console.error('Failed to load drizzle-dev.config:', err);
			throw err;
		}
	}
}

export async function createDbClient() {
	const config = await getDrizzleConfig();

	if (config.type === 'sqlite') {
		// For local development
		const sqlite = new Database(config.credentials.url);
		return drizzleSqlite(sqlite, { schema });
	} else {
		// For production D1 - this won't work in seeding context
		throw new Error('D1 client can only be created in Cloudflare Workers runtime');
	}
}

// Separate function for D1 in Workers runtime
export function createD1Client(d1Database: D1Database) {
	return drizzleD1(d1Database, { schema });
}
