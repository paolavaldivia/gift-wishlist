import {
	type BigGift as DbBigGift,
	bigGifts,
	type Contributor as DbContributor,
	contributors,
	type NewBigGift
} from './schema.js';
import { asc, eq } from 'drizzle-orm';
import type { PurchaseLink } from '$lib/types/gift';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type * as schema from '$lib/server/db/schema';

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

function isDrizzleD1(db: DatabaseInstance): db is DrizzleD1Database<typeof schema> {
	return 'D1' in db;
}

export const bigGiftRepository = {
	async findAll(db: DatabaseInstance): Promise<BigGiftWithContributors[]> {
		const result = await db.select().from(bigGifts).orderBy(asc(bigGifts.name));
		return result.map((dbBigGift) => transformBigGiftForPublic(transformBigGift(dbBigGift, [])));
	},
	async findAllWithContributors(db: DatabaseInstance): Promise<BigGiftWithContributors[]> {
		const result = await db.select().from(bigGifts).orderBy(asc(bigGifts.name));
		const contributions = await db.select().from(contributors);
		return result.map((dbBigGift) =>
			transformBigGiftForPublic(transformBigGift(dbBigGift, contributions))
		);
	},
	async findById(db: DatabaseInstance, id: string): Promise<BigGiftWithContributors | null> {
		const result = await db.select().from(bigGifts).where(eq(bigGifts.id, id));
		if (!result[0]) return null;
		return transformBigGiftForPublic(transformBigGift(result[0], []));
	},
	async findByIdWithContributors(
		db: DatabaseInstance,
		id: string
	): Promise<BigGiftWithContributors | null> {
		const result = await db.select().from(bigGifts).where(eq(bigGifts.id, id));
		const contributions = await db
			.select()
			.from(contributors)
			.where(eq(contributors.bigGiftId, id));
		if (!result[0]) return null;
		return transformBigGiftForPublic(transformBigGift(result[0], contributions));
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
		return transformBigGift(created, []);
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

			return transformBigGift(updated, contributions);
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

			// Return full data for admin (no privacy filtering)
			return transformBigGift(result[0], contributions);
		} catch (error) {
			console.error('Error finding big gift by ID (admin):', error);
			return null;
		}
	},

	async findAllAdmin(db: DatabaseInstance): Promise<BigGiftWithContributors[]> {
		try {
			const result = await db.select().from(bigGifts).orderBy(asc(bigGifts.name));
			const allContributions = await db.select().from(contributors);

			return result.map((dbBigGift) => transformBigGift(dbBigGift, allContributions));
		} catch (error) {
			console.error('Error finding all big gifts (admin):', error);
			throw new Error(
				`Failed to fetch big gifts: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
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
	) {
		const isD1 = isDrizzleD1(db);

		if (!isD1) {
			// BetterSQLite3 transactions must be synchronous
			try {
				const updatedBigGift = db.transaction((tx) => {
					// Insert the contribution record
					tx.insert(contributors)
						.values({
							id: generateId(),
							...contributionData,
							hideContributorName: contributionData.hideContributorName || false
						})
						.run();

					// Get the current big gift
					const currentBigGiftDbResult = tx
						.select()
						.from(bigGifts)
						.where(eq(bigGifts.id, contributionData.bigGiftId));
					const currentBigGift = currentBigGiftDbResult.get();

					if (!currentBigGift) {
						throw new Error(`Big gift with id ${contributionData.bigGiftId} not found`);
					}

					// Update the big gift's current amount
					const updatedDbResult = tx
						.update(bigGifts)
						.set({
							currentAmount: currentBigGift.currentAmount + contributionData.amount,
							updatedAt: new Date()
						})
						.where(eq(bigGifts.id, contributionData.bigGiftId))
						.returning();

					return updatedDbResult.get();
				});

				if (!updatedBigGift) return null;
				const updatedContributions = await db
					.select()
					.from(contributors)
					.where(eq(contributors.bigGiftId, contributionData.bigGiftId));

				return transformBigGiftForPublic(transformBigGift(updatedBigGift, updatedContributions));
			} catch (error) {
				console.error('Error adding contribution:', error);
				throw new Error(
					`Failed to add contribution: ${error instanceof Error ? error.message : 'Unknown error'}`
				);
			}
		} else {
			// D1 transactions are async
			try {
				const updatedBigGift = await db.transaction(async (tx) => {
					// Insert the contribution record
					await tx.insert(contributors).values({
						id: generateId(),
						...contributionData,
						hideContributorName: contributionData.hideContributorName || false
					});

					// Get the current big gift
					const [currentBigGift] = await tx
						.select()
						.from(bigGifts)
						.where(eq(bigGifts.id, contributionData.bigGiftId));

					if (!currentBigGift) {
						throw new Error(`Big gift with id ${contributionData.bigGiftId} not found`);
					}

					// Update the big gift's current amount
					const [updated] = await tx
						.update(bigGifts)
						.set({
							currentAmount: currentBigGift.currentAmount + contributionData.amount,
							updatedAt: new Date()
						})
						.where(eq(bigGifts.id, contributionData.bigGiftId))
						.returning();

					return updated;
				});

				if (!updatedBigGift) return null;
				const updatedContributions = await db
					.select()
					.from(contributors)
					.where(eq(contributors.bigGiftId, contributionData.bigGiftId));

				return transformBigGiftForPublic(transformBigGift(updatedBigGift, updatedContributions));
			} catch (error) {
				console.error('Error adding contribution:', error);
				throw new Error(
					`Failed to add contribution: ${error instanceof Error ? error.message : 'Unknown error'}`
				);
			}
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
	contributions: DbContributor[]
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
		currentAmount: Number(dbBigGift.currentAmount?.toFixed?.(2) ?? dbBigGift.currentAmount),
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
