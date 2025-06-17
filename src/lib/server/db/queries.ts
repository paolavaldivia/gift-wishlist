import { asc, desc, eq } from 'drizzle-orm';
import type { Contributor, Gift, NewBigGift, NewContributor, NewGift } from './schema';
import { bigGifts, contributors, gifts } from './schema';
import type { PurchaseLink } from '$lib/types/gift';

type DatabaseInstance = App.Locals['db'];

// Regular Gifts Functions
export const giftsQueries = {
	// Get all gifts
	async getAll(db: DatabaseInstance): Promise<Gift[]> {
		const result = await db.select().from(gifts).orderBy(asc(gifts.name));
		return sanitizeGifts(result);
	},

	// Get a specific gift by ID
	async getById(db: DatabaseInstance, id: string): Promise<Gift | null> {
		const result = await db.select().from(gifts).where(eq(gifts.id, id));
		if (!result[0]) return null;
		return sanitizeGift(result[0]);
	},

	// Create a new gift
	async create(db: DatabaseInstance, gift: NewGift) {
		const result = await db.insert(gifts).values(gift).returning();
		return sanitizeGift(result[0]);
	},

	// Update a gift
	async update(db: DatabaseInstance, id: string, updates: Partial<NewGift>): Promise<Gift | null> {
		const result = await db
			.update(gifts)
			.set({ ...updates, updatedAt: new Date() })
			.where(eq(gifts.id, id))
			.returning();
		return result[0] ? sanitizeGift(result[0]) : null;
	},

	// Reserve a gift - now with privacy option
	async reserve(
		db: DatabaseInstance,
		id: string,
		takenBy: string,
		hideReserverName = false
	): Promise<Gift | null> {
		const result = await db
			.update(gifts)
			.set({
				isTaken: true,
				takenBy,
				hideReserverName,
				updatedAt: new Date()
			})
			.where(eq(gifts.id, id))
			.returning();
		return result[0] ? sanitizeGift(result[0]) : null;
	},

	// Unreserve a gift
	async unreserve(db: DatabaseInstance, id: string): Promise<Gift | null> {
		const result = await db
			.update(gifts)
			.set({
				isTaken: false,
				takenBy: null,
				hideReserverName: false, // Reset privacy setting when unreserving
				updatedAt: new Date()
			})
			.where(eq(gifts.id, id))
			.returning();
		return result[0] ? sanitizeGift(result[0]) : null;
	},

	// Delete a gift
	async delete(db: DatabaseInstance, id: string) {
		await db.delete(gifts).where(eq(gifts.id, id));
	},

	// Get available (not taken) gifts
	async getAvailable(db: DatabaseInstance) {
		const result = await db
			.select()
			.from(gifts)
			.where(eq(gifts.isTaken, false))
			.orderBy(asc(gifts.name));
		return sanitizeGifts(result);
	},

	// Get taken gifts
	async getTaken(db: DatabaseInstance) {
		const result = await db
			.select()
			.from(gifts)
			.where(eq(gifts.isTaken, true))
			.orderBy(desc(gifts.updatedAt));
		return sanitizeGifts(result);
	}
};

// Big Gifts Functions
export const bigGiftsQueries = {
	// Get all big gifts with their contributors
	async getAllWithContributors(db: DatabaseInstance) {
		const bigGiftsData = await db.select().from(bigGifts).orderBy(asc(bigGifts.name));

		const bigGiftsWithContributors = await Promise.all(
			bigGiftsData.map(async (bigGift) => {
				const giftContributors = await db
					.select()
					.from(contributors)
					.where(eq(contributors.bigGiftId, bigGift.id))
					.orderBy(desc(contributors.createdAt));

				return {
					...bigGift,
					contributors: sanitizeContributors(giftContributors)
				};
			})
		);

		return bigGiftsWithContributors;
	},

	// Get a specific big gift with contributors
	async getByIdWithContributors(db: DatabaseInstance, id: string) {
		const bigGift = await db.select().from(bigGifts).where(eq(bigGifts.id, id));
		if (!bigGift[0]) return null;

		const giftContributors = await db
			.select()
			.from(contributors)
			.where(eq(contributors.bigGiftId, id))
			.orderBy(desc(contributors.createdAt));

		return {
			...bigGift[0],
			contributors: sanitizeContributors(giftContributors)
		};
	},

	// Create a new big gift
	async create(db: DatabaseInstance, bigGift: NewBigGift) {
		const result = await db.insert(bigGifts).values(bigGift).returning();
		return result[0];
	},

	// Add a contribution to a big gift - now with privacy option
	async addContribution(db: DatabaseInstance, contribution: NewContributor) {
		const result = await db.insert(contributors).values(contribution).returning();

		// Update the current amount for the big gift
		if (result[0]) {
			await db
				.update(bigGifts)
				.set({
					currentAmount: contribution.amount,
					updatedAt: new Date()
				})
				.where(eq(bigGifts.id, contribution.bigGiftId));
		}

		return sanitizeContributor(result[0]);
	},

	// Update big gift current amount (recalculate from all contributions)
	async recalculateAmount(db: DatabaseInstance, bigGiftId: string) {
		const allContributions = await db
			.select()
			.from(contributors)
			.where(eq(contributors.bigGiftId, bigGiftId));

		const totalAmount = allContributions.reduce((sum, contrib) => sum + contrib.amount, 0);

		await db
			.update(bigGifts)
			.set({
				currentAmount: totalAmount,
				updatedAt: new Date()
			})
			.where(eq(bigGifts.id, bigGiftId));

		return totalAmount;
	},

	// Mark big gift as complete when target is reached
	async markAsComplete(db: DatabaseInstance, id: string) {
		const result = await db
			.update(bigGifts)
			.set({
				isTaken: true,
				updatedAt: new Date()
			})
			.where(eq(bigGifts.id, id))
			.returning();
		return result[0] || null;
	}
};

// Helper function to generate unique IDs
export function generateId(): string {
	return crypto.randomUUID();
}

function sanitizeGift(gift: Gift): Gift {
	let purchaseLinks: PurchaseLink[] = [];

	try {
		// Handle both string and already parsed JSON
		if (typeof gift.purchaseLinks === 'string') {
			purchaseLinks = JSON.parse(gift.purchaseLinks);
		} else if (Array.isArray(gift.purchaseLinks)) {
			purchaseLinks = gift.purchaseLinks;
		}
	} catch (error) {
		console.error('Error parsing purchaseLinks for gift', gift.id, error);
		purchaseLinks = [];
	}

	return {
		...gift,
		purchaseLinks,
		approximatePrice: Number(gift.approximatePrice?.toFixed?.(2) ?? gift.approximatePrice),
		// Ensure boolean consistency
		isTaken: Boolean(gift.isTaken),
		hideReserverName: Boolean(gift.hideReserverName),
		takenBy: gift.isTaken ? (gift.hideReserverName ? null : gift.takenBy) : null
	};
}

function sanitizeGifts(gifts: Gift[]): Gift[] {
	return gifts.map(sanitizeGift);
}

// Define a type for sanitized contributor
type SanitizedContributor = Omit<typeof contributors.$inferSelect, 'contributors'>;

function sanitizeContributor(contributor: typeof contributors.$inferSelect): SanitizedContributor {
	return {
		...contributor,
		hideContributorName: Boolean(contributor.hideContributorName),
		// Apply privacy: hide name if privacy is enabled
		name: contributor.hideContributorName ? '' : contributor.name
	};
}

function sanitizeContributors(contributors: Contributor[]): Array<SanitizedContributor> {
	return contributors.map(sanitizeContributor);
}
