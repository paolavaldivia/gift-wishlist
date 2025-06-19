import { type BigGift as DbBigGift, bigGifts, contributors, type NewBigGift } from './schema.js';
import { asc, eq } from 'drizzle-orm';
import type { PurchaseLink } from '$lib/types/gift';

export interface BigGift {
	id: string;
	name: string;
	description: string;
	imagePath: string;
	targetAmount: number;
	currentAmount: number;
	currency: string;
	purchaseLinks: PurchaseLink[];
	isTaken: boolean;
	takenBy: string | null;
	createdAt: Date;
	updatedAt: Date;
}

type DatabaseInstance = App.Locals['db'];

export const bigGiftRepository = {
	async findAll(db: DatabaseInstance): Promise<BigGift[]> {
		const result = await db.select().from(bigGifts).orderBy(asc(bigGifts.name));
		return result.map(transformBigGift);
	},

	async findById(db: DatabaseInstance, id: string): Promise<BigGift | null> {
		const result = await db.select().from(bigGifts).where(eq(bigGifts.id, id));
		if (!result[0]) return null;
		return transformBigGift(result[0]);
	},

	async create(
		db: DatabaseInstance,
		newBigGiftData: Omit<
			NewBigGift,
			'id' | 'createdAt' | 'updatedAt' | 'currentAmount' | 'isTaken' | 'takenBy'
		>
	): Promise<BigGift> {
		const bigGiftData = {
			id: generateId(),
			...newBigGiftData,
			currentAmount: 0,
			isTaken: false,
			takenBy: null,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const [created] = await db.insert(bigGifts).values(bigGiftData).returning();
		return transformBigGift(created);
	},

	async addContribution(
		db: DatabaseInstance,
		contributionData: {
			bigGiftId: string;
			name: string;
			amount: number;
			email?: string;
			message?: string;
			hideContributorName?: boolean;
			createdAt: Date;
		}
	): Promise<BigGift | null> {
		let updatedBigGift: DbBigGift | null = null;

		// Start a transaction to ensure both operations succeed or fail together
		await db.transaction(async (tx) => {
			// Insert the contribution record
			await tx.insert(contributors).values({
				id: generateId(),
				...contributionData,
				hideContributorName: contributionData.hideContributorName || false
			});

			// First get the current amount
			const [currentBigGift] = await tx
				.select()
				.from(bigGifts)
				.where(eq(bigGifts.id, contributionData.bigGiftId));

			if (!currentBigGift) return;

			// Update the big gift's current amount
			const [updated] = await tx
				.update(bigGifts)
				.set({
					currentAmount: currentBigGift.currentAmount + contributionData.amount,
					updatedAt: new Date()
				})
				.where(eq(bigGifts.id, contributionData.bigGiftId))
				.returning();

			if (updated) {
				updatedBigGift = updated;
			}
		});

		// Return the transformed big gift if we got an update
		return updatedBigGift ? transformBigGift(updatedBigGift) : null;
	},
	async delete(db: DatabaseInstance, id: string): Promise<void> {
		await db.delete(bigGifts).where(eq(bigGifts.id, id));
	}
};

function generateId(): string {
	return crypto.randomUUID();
}

function transformBigGift(dbBigGift: DbBigGift): BigGift {
	return {
		id: dbBigGift.id,
		name: dbBigGift.name,
		description: dbBigGift.description,
		imagePath: dbBigGift.imagePath,
		targetAmount: Number(dbBigGift.targetAmount?.toFixed?.(2) ?? dbBigGift.targetAmount),
		currentAmount: Number(dbBigGift.currentAmount?.toFixed?.(2) ?? dbBigGift.currentAmount),
		currency: dbBigGift.currency,
		purchaseLinks: dbBigGift.purchaseLinks,
		isTaken: Boolean(dbBigGift.isTaken),
		takenBy: dbBigGift.takenBy,
		createdAt: dbBigGift.createdAt,
		updatedAt: dbBigGift.updatedAt
	};
}
