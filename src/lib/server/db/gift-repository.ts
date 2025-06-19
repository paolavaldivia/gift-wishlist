// src/lib/server/db/gift-repository.ts
import { asc, desc, eq } from 'drizzle-orm';
import type { Gift as DbGift, NewGift } from './schema.js';
import { gifts } from './schema.js';

type DatabaseInstance = App.Locals['db'];

export interface PurchaseLink {
	siteName: string;
	url: string;
}

export interface Gift {
	id: string;
	name: string;
	description: string;
	imagePath: string;
	approximatePrice: number;
	currency: string;
	purchaseLinks: PurchaseLink[];
	isTaken: boolean;
	takenBy: string | null;
	hideReserverName: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface PublicGift extends Omit<Gift, 'takenBy' | 'hideReserverName'> {
	takenBy: string | null; // Will be null if hidden
	isAnonymous?: boolean; // Indicates if reserver name is hidden
}

function transformGift(dbGift: DbGift): Gift {
	let purchaseLinks: PurchaseLink[] = [];

	try {
		if (typeof dbGift.purchaseLinks === 'string') {
			purchaseLinks = JSON.parse(dbGift.purchaseLinks);
		} else if (Array.isArray(dbGift.purchaseLinks)) {
			purchaseLinks = dbGift.purchaseLinks;
		}
	} catch (error) {
		console.error('Error parsing purchaseLinks for gift', dbGift.id, error);
		purchaseLinks = [];
	}

	return {
		id: dbGift.id,
		name: dbGift.name,
		description: dbGift.description,
		imagePath: dbGift.imagePath,
		approximatePrice: Number(dbGift.approximatePrice?.toFixed?.(2) ?? dbGift.approximatePrice),
		currency: dbGift.currency,
		purchaseLinks,
		isTaken: Boolean(dbGift.isTaken),
		takenBy: dbGift.takenBy,
		hideReserverName: Boolean(dbGift.hideReserverName),
		createdAt: dbGift.createdAt,
		updatedAt: dbGift.updatedAt
	};
}

// Transform gift for public consumption (applies privacy rules)
function transformGiftForPublic(gift: Gift): PublicGift {
	return {
		id: gift.id,
		name: gift.name,
		description: gift.description,
		imagePath: gift.imagePath,
		approximatePrice: gift.approximatePrice,
		currency: gift.currency,
		purchaseLinks: gift.purchaseLinks,
		isTaken: gift.isTaken,
		createdAt: gift.createdAt,
		updatedAt: gift.updatedAt,
		// Apply privacy logic
		takenBy: gift.isTaken && !gift.hideReserverName ? gift.takenBy : null,
		isAnonymous: gift.isTaken && gift.hideReserverName
	};
}

function generateId(): string {
	return crypto.randomUUID();
}

export const giftRepository = {
	async findAll(db: DatabaseInstance): Promise<PublicGift[]> {
		const result = await db.select().from(gifts).orderBy(asc(gifts.name));
		return result.map((dbGift) => transformGiftForPublic(transformGift(dbGift)));
	},

	async findById(db: DatabaseInstance, id: string): Promise<PublicGift | null> {
		const result = await db.select().from(gifts).where(eq(gifts.id, id));
		if (!result[0]) return null;
		return transformGiftForPublic(transformGift(result[0]));
	},

	async findAvailable(db: DatabaseInstance): Promise<PublicGift[]> {
		const result = await db
			.select()
			.from(gifts)
			.where(eq(gifts.isTaken, false))
			.orderBy(asc(gifts.name));
		return result.map((dbGift) => transformGiftForPublic(transformGift(dbGift)));
	},

	async findTaken(db: DatabaseInstance): Promise<PublicGift[]> {
		const result = await db
			.select()
			.from(gifts)
			.where(eq(gifts.isTaken, true))
			.orderBy(desc(gifts.updatedAt));
		return result.map((dbGift) => transformGiftForPublic(transformGift(dbGift)));
	},

	// Admin methods return full Gift (no privacy filtering)
	async findAllAdmin(db: DatabaseInstance): Promise<Gift[]> {
		const result = await db.select().from(gifts).orderBy(asc(gifts.name));
		return result.map(transformGift);
	},

	async findByIdAdmin(db: DatabaseInstance, id: string): Promise<Gift | null> {
		const result = await db.select().from(gifts).where(eq(gifts.id, id));
		if (!result[0]) return null;
		return transformGift(result[0]);
	},

	async create(
		db: DatabaseInstance,
		newGiftData: Omit<NewGift, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<PublicGift> {
		const giftData = {
			id: generateId(),
			...newGiftData,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const [created] = await db.insert(gifts).values(giftData).returning();
		return transformGiftForPublic(transformGift(created));
	},

	async createAdmin(
		db: DatabaseInstance,
		newGiftData: Omit<NewGift, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<Gift> {
		const giftData = {
			id: generateId(),
			...newGiftData,
			createdAt: new Date(),
			updatedAt: new Date()
		};
		const [created] = await db.insert(gifts).values(giftData).returning();
		return transformGift(created);
	},

	async update(
		db: DatabaseInstance,
		id: string,
		updates: Partial<NewGift>
	): Promise<PublicGift | null> {
		const [updated] = await db
			.update(gifts)
			.set({ ...updates, updatedAt: new Date() })
			.where(eq(gifts.id, id))
			.returning();

		if (!updated) return null;
		return transformGiftForPublic(transformGift(updated));
	},

	async updateAdmin(
		db: DatabaseInstance,
		id: string,
		updates: Partial<NewGift>
	): Promise<Gift | null> {
		const [updated] = await db
			.update(gifts)
			.set({ ...updates, updatedAt: new Date() })
			.where(eq(gifts.id, id))
			.returning();

		if (!updated) return null;
		return transformGift(updated);
	},

	async reserve(
		db: DatabaseInstance,
		id: string,
		takenBy: string,
		hideReserverName = false
	): Promise<PublicGift | null> {
		const [updated] = await db
			.update(gifts)
			.set({
				isTaken: true,
				takenBy,
				hideReserverName,
				updatedAt: new Date()
			})
			.where(eq(gifts.id, id))
			.returning();

		if (!updated) return null;
		return transformGiftForPublic(transformGift(updated));
	},

	async unreserve(db: DatabaseInstance, id: string): Promise<PublicGift | null> {
		const [updated] = await db
			.update(gifts)
			.set({
				isTaken: false,
				takenBy: null,
				hideReserverName: false,
				updatedAt: new Date()
			})
			.where(eq(gifts.id, id))
			.returning();

		if (!updated) return null;
		return transformGiftForPublic(transformGift(updated));
	},

	async delete(db: DatabaseInstance, id: string): Promise<void> {
		await db.delete(gifts).where(eq(gifts.id, id));
	}
};
