import {
	type BigGift as DbBigGift,
	bigGifts,
	type Contributor as DbContributor,
	contributors,
	type NewBigGift
} from './schema.js';
import { asc, eq, sum } from 'drizzle-orm';
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
	createdAt: Date;
	updatedAt: Date;
}

export interface BigGiftWithContributors extends BigGift {
	contributors: Contributor[];
}

type DatabaseInstance = App.Locals['db'];

export const bigGiftRepository = {
	async findAll(db: DatabaseInstance): Promise<BigGiftWithContributors[]> {
		const bigGiftsResult = await db.select().from(bigGifts).orderBy(asc(bigGifts.name));
		const contributions = await db
			.select({ bigGiftId: contributors.bigGiftId, total: sum(contributors.amount) })
			.from(contributors)
			.groupBy(contributors.bigGiftId);

		const result = bigGiftsResult.map((dbBigGift) => {
			const total = contributions.find((c) => c.bigGiftId === dbBigGift.id)?.total ?? 0;
			return {
				...dbBigGift,
				currentAmount: total
			};
		});

		return result.map((dbBigGift) => transformBigGiftForPublic(transformBigGift(dbBigGift, [])));
	},
	async findAllWithContributors(db: DatabaseInstance): Promise<BigGiftWithContributors[]> {
		const result = await db.select().from(bigGifts).orderBy(asc(bigGifts.name));
		const allContributions = await db.select().from(contributors);
		return result.map((dbBigGift) => {
			const giftContributions = allContributions.filter((c) => c.bigGiftId === dbBigGift.id);
			const currentAmount = giftContributions.reduce((sum, c) => sum + Number(c.amount), 0);
			console.log('currentAmount', currentAmount);
			console.log(dbBigGift);
			return transformBigGiftForPublic(
				transformBigGift(dbBigGift, allContributions, currentAmount)
			);
		});
	},
	async findById(db: DatabaseInstance, id: string): Promise<BigGiftWithContributors | null> {
		const result = await db.select().from(bigGifts).where(eq(bigGifts.id, id));
		if (!result[0]) return null;
		return transformBigGiftForPublic(transformBigGift(result[0], [], 0));
	},
	async findByIdWithContributors(
		db: DatabaseInstance,
		id: string
	): Promise<BigGiftWithContributors | null> {
		const result = await db.select().from(bigGifts).where(eq(bigGifts.id, id));

		if (!result[0]) return null;
		const contributions = await db
			.select()
			.from(contributors)
			.where(eq(contributors.bigGiftId, id));
		const total = contributions.reduce((sum, c) => sum + c.amount, 0);
		return transformBigGiftForPublic(transformBigGift(result[0], contributions, total));
	},
	async createAdmin(
		db: DatabaseInstance,
		newBigGiftData: Omit<
			NewBigGift,
			'id' | 'createdAt' | 'updatedAt' | 'currentAmount' | 'isTaken' | 'takenBy'
		>
	): Promise<BigGiftWithContributors> {
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
		return transformBigGift(created, [], 0);
	},
	async updateAdmin(
		db: DatabaseInstance,
		id: string,
		updateData: Partial<{
			name: string;
			description: string;
			imagePath: string;
			targetAmount: number;
			currency: string;
			purchaseLinks: PurchaseLink[];
		}>
	): Promise<BigGiftWithContributors | null> {
		try {
			const dataToUpdate = {
				...updateData,
				updatedAt: new Date(),
				// Serialize purchaseLinks if provided
				...(updateData.purchaseLinks && {
					purchaseLinks: JSON.stringify(updateData.purchaseLinks)
				})
			};

			const [updated] = await db
				.update(bigGifts)
				.set(dataToUpdate)
				.where(eq(bigGifts.id, id))
				.returning();

			if (!updated) return null;

			// Get contributors for the updated big gift
			const contributions = await db
				.select()
				.from(contributors)
				.where(eq(contributors.bigGiftId, id));
			const total = contributions.reduce((sum, c) => sum + c.amount, 0);

			return transformBigGift(updated, contributions, total);
		} catch (error) {
			console.error('Error updating big gift:', error);
			throw new Error(
				`Failed to update big gift: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	},

	async delete(db: DatabaseInstance, id: string): Promise<void> {
		try {
			// Delete contributors first (should be handled by CASCADE, but being explicit)
			await db.delete(contributors).where(eq(contributors.bigGiftId, id));

			// Delete the big gift
			await db.delete(bigGifts).where(eq(bigGifts.id, id));
		} catch (error) {
			console.error('Error deleting big gift:', error);
			throw new Error(
				`Failed to delete big gift: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	},

	async findByIdAdmin(db: DatabaseInstance, id: string): Promise<BigGiftWithContributors | null> {
		try {
			const result = await db.select().from(bigGifts).where(eq(bigGifts.id, id));
			if (!result[0]) return null;

			const contributions = await db
				.select()
				.from(contributors)
				.where(eq(contributors.bigGiftId, id));
			const total = contributions.reduce((sum, c) => sum + c.amount, 0);

			// Return full data for admin (no privacy filtering)
			return transformBigGift(result[0], contributions, total);
		} catch (error) {
			console.error('Error finding big gift by ID (admin):', error);
			return null;
		}
	},

	async findAllAdmin(db: DatabaseInstance): Promise<BigGiftWithContributors[]> {
		try {
			const result = await db.select().from(bigGifts).orderBy(asc(bigGifts.name));
			const allContributions = await db.select().from(contributors);

			return result.map((dbBigGift) => {
				const contributions = allContributions.filter((c) => c.bigGiftId === dbBigGift.id);
				const total = contributions.reduce((sum, c) => sum + c.amount, 0);
				return transformBigGift(dbBigGift, allContributions, total);
			});
		} catch (error) {
			console.error('Error finding all big gifts (admin):', error);
			throw new Error(
				`Failed to fetch big gifts: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	},

	/**
	 * Add a contribution to a big gift
	 */
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
	): Promise<BigGiftWithContributors | null> {
		try {
			// Verify the big gift exists
			const [bigGift] = await db
				.select()
				.from(bigGifts)
				.where(eq(bigGifts.id, contributionData.bigGiftId));

			if (!bigGift) {
				throw new Error(`Big gift with id ${contributionData.bigGiftId} not found`);
			}

			// Insert the contribution - this is now the only database operation needed!
			const contributorId = generateId();
			await db.insert(contributors).values({
				id: contributorId,
				...contributionData,
				hideContributorName: contributionData.hideContributorName || false
			});

			// Get all contributions for this big gift to calculate the new total
			const updatedContributions = await db
				.select()
				.from(contributors)
				.where(eq(contributors.bigGiftId, contributionData.bigGiftId));

			const currentAmount = updatedContributions.reduce((sum, c) => sum + Number(c.amount), 0);

			return transformBigGiftForPublic(
				transformBigGift(bigGift, updatedContributions, currentAmount)
			);
		} catch (error) {
			console.error('Error adding contribution:', error);
			throw new Error(
				`Failed to add contribution: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}
};

function generateId(): string {
	return crypto.randomUUID();
}

function transformBigGiftForPublic(bigGift: BigGiftWithContributors): BigGiftWithContributors {
	return {
		...bigGift,
		contributors: bigGift.contributors.map(transformPublicContributor)
	};
}

function transformBigGift(
	dbBigGift: DbBigGift,
	contributions: DbContributor[],
	totalContributed?: number
): BigGiftWithContributors {
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
		.map(transformContributor);

	return {
		id: dbBigGift.id,
		name: dbBigGift.name,
		description: dbBigGift.description,
		imagePath: dbBigGift.imagePath,
		targetAmount: Number(dbBigGift.targetAmount?.toFixed?.(2) ?? dbBigGift.targetAmount),
		currentAmount: Number(totalContributed?.toFixed?.(2)),
		currency: dbBigGift.currency,
		purchaseLinks,
		createdAt: dbBigGift.createdAt,
		updatedAt: dbBigGift.updatedAt,
		contributors
	};
}

function transformContributor(dbContributor: any): Contributor {
	return {
		id: dbContributor.id,
		name: dbContributor.name,
		amount: Number(dbContributor.amount?.toFixed?.(2) ?? dbContributor.amount),
		email: dbContributor.email,
		message: dbContributor.message,
		hideContributorName: Boolean(dbContributor.hideContributorName),
		createdAt: dbContributor.createdAt
	};
}

function transformPublicContributor(contributor: Contributor): Contributor {
	return {
		...contributor,
		name: contributor.hideContributorName ? 'Anonymous' : contributor.name,
		email: undefined,
		message: undefined
	};
}
