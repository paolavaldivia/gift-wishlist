import { z } from 'zod';

// Re-export validation schemas and add doc-specific ones
export const PurchaseLinkSchema = z.object({
	siteName: z.string().min(1).max(50).describe('Name of the shopping site'),
	url: z.string().url().describe('Direct link to the product')
});

export const ReserveGiftSchema = z.object({
	action: z.literal('reserve').describe('Must be "reserve"'),
	name: z.string().min(1).max(100).describe('Name of person reserving the gift'),
	hideReserverName: z
		.boolean()
		.default(false)
		.describe('Whether to hide the reserver name from public view')
});

export const CreateGiftSchema = z.object({
	name: z.string().min(1).max(100).describe('Gift name'),
	description: z.string().min(1).max(1000).describe('Detailed description of the gift'),
	imagePath: z.string().min(1).describe('Path to gift image'),
	approximatePrice: z.number().positive().max(999999).describe('Estimated price'),
	currency: z.enum(['EUR', 'USD', 'PEN']).describe('Currency code'),
	purchaseLinks: z
		.array(PurchaseLinkSchema)
		.default([])
		.describe('Links where the gift can be purchased')
});

export const UpdateGiftSchema = CreateGiftSchema.partial().describe(
	'Partial gift update (all fields optional)'
);

export const AdminActionSchema = z.object({
	action: z.enum(['unreserve']).describe('Admin action to perform')
});

export const QueryParamsSchema = z.object({
	filter: z.enum(['available', 'taken']).optional().describe('Filter gifts by availability'),
	limit: z.number().min(1).max(100).default(50).optional().describe('Number of items to return'),
	offset: z.number().min(0).default(0).optional().describe('Number of items to skip'),
	includePrivate: z
		.boolean()
		.default(false)
		.optional()
		.describe('Include private information (admin only)')
});

// Response schemas
export const PublicGiftSchema = z.object({
	id: z.string().uuid().describe('Unique gift identifier'),
	name: z.string().describe('Gift name'),
	description: z.string().describe('Gift description'),
	imagePath: z.string().describe('Path to gift image'),
	approximatePrice: z.number().describe('Estimated price'),
	currency: z.string().describe('Currency code'),
	purchaseLinks: z.array(PurchaseLinkSchema).describe('Purchase links'),
	isTaken: z.boolean().describe('Whether the gift is reserved'),
	takenBy: z.string().nullable().describe('Name of person who reserved (null if private)'),
	isAnonymous: z.boolean().optional().describe('True if reserver chose to hide their name'),
	createdAt: z.string().datetime().describe('Creation timestamp'),
	updatedAt: z.string().datetime().describe('Last update timestamp')
});

export const AdminGiftSchema = PublicGiftSchema.extend({
	hideReserverName: z.boolean().describe('Privacy setting for reserver name')
});

export const PaginatedResponseSchema = z.object({
	gifts: z.array(PublicGiftSchema).describe('Array of gifts'),
	pagination: z.object({
		total: z.number().describe('Total number of gifts'),
		limit: z.number().describe('Items per page'),
		offset: z.number().describe('Items skipped'),
		hasMore: z.boolean().describe('Whether more items are available')
	}),
	stats: z.object({
		total: z.number().describe('Total gifts'),
		available: z.number().describe('Available gifts'),
		taken: z.number().describe('Reserved gifts')
	})
});

export const SuccessResponseSchema = z.object({
	success: z.boolean().describe('Operation success status'),
	message: z.string().describe('Human-readable message'),
	gift: PublicGiftSchema.optional().describe('Updated gift object')
});
