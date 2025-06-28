import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const currencies = ['EUR', 'USD', 'PEN'] as const;
type Currency = (typeof currencies)[number];

export const gifts = sqliteTable('gifts', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description').notNull(),
	imagePath: text('image_path').notNull(),
	approximatePrice: real('approximate_price').notNull(),
	currency: text('currency').$type<Currency>().notNull().default('EUR'),
	// Store purchase links as JSON string
	purchaseLinks: text('purchase_links', { mode: 'json' })
		.$type<Array<{ siteName: string; url: string }>>()
		.notNull()
		.default([]),
	isTaken: integer('is_taken', { mode: 'boolean' }).notNull().default(false),
	takenBy: text('taken_by'),
	hideReserverName: integer('hide_reserver_name', { mode: 'boolean' }).notNull().default(false),
	// Timestamps
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
		.$onUpdate(() => new Date())
});

// Big gifts table for gifts that require pooled contributions
export const bigGifts = sqliteTable('big_gifts', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description').notNull(),
	imagePath: text('image_path').notNull(),
	targetAmount: real('target_amount').notNull(),
	currency: text('currency').$type<Currency>().notNull().default('EUR'),
	purchaseLinks: text('purchase_links', { mode: 'json' })
		.$type<Array<{ siteName: string; url: string }>>()
		.notNull()
		.default([]),
	isTaken: integer('is_taken', { mode: 'boolean' }).notNull().default(false),
	takenBy: text('taken_by'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
		.$onUpdate(() => new Date())
});

// Contributors table for big gifts - unchanged
export const contributors = sqliteTable('contributors', {
	id: text('id').primaryKey(),
	bigGiftId: text('big_gift_id')
		.notNull()
		.references(() => bigGifts.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	amount: real('amount').notNull(),
	email: text('email'), // Optional for contact
	message: text('message'), // Optional contribution message
	hideContributorName: integer('hide_contributor_name', { mode: 'boolean' })
		.notNull()
		.default(false),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// Export types for use in the application
export type Gift = typeof gifts.$inferSelect;
export type NewGift = typeof gifts.$inferInsert;
export type BigGift = typeof bigGifts.$inferSelect;
export type NewBigGift = typeof bigGifts.$inferInsert;
export type Contributor = typeof contributors.$inferSelect;
export type NewContributor = typeof contributors.$inferInsert;
