// src/lib/server/db/index.ts
import { createD1Client } from './config';
import type { D1Database } from '@cloudflare/workers-types';

export interface Env {
	DB: D1Database;
}

export function getDb(env: Env) {
	return createD1Client(env.DB);
}
