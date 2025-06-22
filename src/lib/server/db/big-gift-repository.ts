import {
	type BigGift as DbBigGift,
	bigGifts,
	type Contributor as DbContributor,
	contributors,
	type NewBigGift
} from './schema.js';
import { asc, eq } from 'drizzle-orm';
import type { PurchaseLink } from '$lib/types/gift';

export interface Contributor {
	id: string;
	name: string;
	amount: number;
	email?: string | null;
	message?: string | null;
	hideContributorName: boolean;
	createdAt: Date;
}

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
	contributors: Contributor[];
}
type DatabaseInstance = App.Locals['db'];

export const bigGiftRepository = {
	async findAll(db: DatabaseInstance): Promise<BigGift[]> {
		const result = await db.select().from(bigGifts).orderBy(asc(bigGifts.name));
		const contributions = await db.select().from(contributors);
		return result.map((dbBigGift) =>
			transformBigGiftForPublic(transformBigGift(dbBigGift, contributions))
		);
	},

	async findById(db: DatabaseInstance, id: string): Promise<BigGift | null> {
		const result = await db.select().from(bigGifts).where(eq(bigGifts.id, id));
		const contributions = await db
			.select()
			.from(contributors)
			.where(eq(contributors.bigGiftId, id));
		if (!result[0]) return null;
		return transformBigGift(result[0], contributions);
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
		return transformBigGift(created, []);
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
		let updatedContributions: DbContributor[] = [];

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
				updatedContributions = await tx.select().from(contributors);
			}
		});

		// Return the transformed big gift if we got an update
		return updatedBigGift
			? transformBigGiftForPublic(transformBigGift(updatedBigGift, updatedContributions))
			: null;
	},
	async delete(db: DatabaseInstance, id: string): Promise<void> {
		await db.delete(bigGifts).where(eq(bigGifts.id, id));
	}
};

function generateId(): string {
	return crypto.randomUUID();
}

function transformBigGiftForPublic(bigGift: BigGift): BigGift {
	return {
		...bigGift,
		contributors: bigGift.contributors.map((c) => ({
			...c,
			email: undefined,
			message: undefined
		}))
	};
}

function transformBigGift(dbBigGift: DbBigGift, contributions: DbContributor[]): BigGift {
	let purchaseLinks: PurchaseLink[] = [];

	try {
		if (typeof dbBigGift.purchaseLinks === 'string') {
			purchaseLinks = JSON.parse(dbBigGift.purchaseLinks);
		} else if (Array.isArray(dbBigGift.purchaseLinks)) {
			purchaseLinks = dbBigGift.purchaseLinks;
		}
	} catch (error) {
		console.error('Error parsing purchaseLinks for big gift', dbBigGift.id, error);
		purchaseLinks = [];
	}

	const contributors = contributions
		.filter((c) => c.bigGiftId === dbBigGift.id)
		.map((c) => ({
			id: c.id,
			name: c.name,
			amount: c.amount,
			email: c.email,
			message: c.message,
			hideContributorName: Boolean(c.hideContributorName),
			createdAt: c.createdAt
		}));

	return {
		id: dbBigGift.id,
		name: dbBigGift.name,
		description: dbBigGift.description,
		imagePath: dbBigGift.imagePath,
		targetAmount: Number(dbBigGift.targetAmount?.toFixed?.(2) ?? dbBigGift.targetAmount),
		currentAmount: Number(dbBigGift.currentAmount?.toFixed?.(2) ?? dbBigGift.currentAmount),
		currency: dbBigGift.currency,
		purchaseLinks,
		isTaken: Boolean(dbBigGift.isTaken),
		takenBy: dbBigGift.takenBy,
		createdAt: dbBigGift.createdAt,
		updatedAt: dbBigGift.updatedAt,
		contributors
	};
}
