import 'dotenv/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { seedDatabase } from '$lib/server/db/seedUtils';

async function main() {
	// Only works for local development
	if (process.env.NODE_ENV === 'production') {
		console.error(
			'Cannot seed production D1 database directly. Use the seed endpoint or wrangler commands.'
		);
		process.exit(1);
	}

	if (!process.env.DATABASE_URL) {
		throw new Error('DATABASE_URL is not set');
	}

	// Create local SQLite connection
	const sqlite = new Database(process.env.DATABASE_URL);
	const db = drizzle(sqlite, { schema });

	await seedDatabase(db);

	console.log('Local database seeded successfully!');

	sqlite.close();
}

main().catch(console.error);
