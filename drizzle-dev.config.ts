import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Define a more specific type for our SQLite configuration
type SQLiteConfig = ReturnType<typeof defineConfig> & {
	dbCredentials: {
		url: string;
	};
};

const config = defineConfig({
	out: './drizzle',
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: process.env.DATABASE_URL
	},
	verbose: true,
	strict: true
}) as SQLiteConfig;

export default config;
