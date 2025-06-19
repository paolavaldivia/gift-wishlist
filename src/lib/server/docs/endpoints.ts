import { z, ZodSchema } from 'zod';
import {
	AdminActionSchema,
	AdminGiftSchema,
	CreateGiftSchema,
	PaginatedResponseSchema,
	PublicGiftSchema,
	QueryParamsSchema,
	ReserveGiftSchema,
	SuccessResponseSchema,
	UpdateGiftSchema
} from '$lib/server/docs/schemas';

export interface EndpointDefinition {
	method: string;
	path: string;
	description: string;
	summary: string;
	tags: string[];
	auth: 'none' | 'admin';
	queryParams?: ZodSchema;
	requestBody?: ZodSchema;
	responseBody?: ZodSchema;
	examples?: {
		request?: any;
		response?: any;
	};
}

export const apiEndpoints: EndpointDefinition[] = [
	// Public Endpoints
	{
		method: 'GET',
		path: '/api/gifts',
		summary: 'List all gifts',
		description:
			'Retrieve a paginated list of gifts with privacy filtering applied. Public users only see non-private information.',
		tags: ['Public', 'Gifts'],
		auth: 'none',
		queryParams: QueryParamsSchema.pick({ filter: true, limit: true, offset: true }),
		responseBody: PaginatedResponseSchema,
		examples: {
			request: { filter: 'available', limit: 10, offset: 0 },
			response: {
				gifts: [
					{
						id: '123e4567-e89b-12d3-a456-426614174000',
						name: 'Coffee Maker',
						description: 'High-quality espresso machine',
						imagePath: '/images/coffee-maker.jpg',
						approximatePrice: 299.99,
						currency: 'EUR',
						purchaseLinks: [{ siteName: 'Amazon', url: 'https://amazon.com/coffee-maker' }],
						isTaken: false,
						takenBy: null,
						createdAt: '2025-01-01T00:00:00Z',
						updatedAt: '2025-01-01T00:00:00Z'
					}
				],
				pagination: { total: 1, limit: 10, offset: 0, hasMore: false },
				stats: { total: 1, available: 1, taken: 0 }
			}
		}
	},

	{
		method: 'GET',
		path: '/api/gifts/{id}',
		summary: 'Get a specific gift',
		description:
			'Retrieve details for a specific gift by ID. Privacy filtering is applied for public access.',
		tags: ['Public', 'Gifts'],
		auth: 'none',
		responseBody: PublicGiftSchema,
		examples: {
			response: {
				id: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Coffee Maker',
				description: 'High-quality espresso machine',
				imagePath: '/images/coffee-maker.jpg',
				approximatePrice: 299.99,
				currency: 'EUR',
				purchaseLinks: [],
				isTaken: true,
				takenBy: 'John D.', // null if private
				isAnonymous: false,
				createdAt: '2025-01-01T00:00:00Z',
				updatedAt: '2025-01-01T00:00:00Z'
			}
		}
	},

	{
		method: 'PATCH',
		path: '/api/gifts/{id}',
		summary: 'Reserve a gift',
		description:
			'Reserve an available gift. Only the "reserve" action is allowed for public users.',
		tags: ['Public', 'Gifts'],
		auth: 'none',
		requestBody: ReserveGiftSchema,
		responseBody: SuccessResponseSchema,
		examples: {
			request: {
				action: 'reserve',
				name: 'John Doe',
				hideReserverName: false
			},
			response: {
				success: true,
				message: 'Successfully reserved "Coffee Maker"',
				gift: {
					id: '123e4567-e89b-12d3-a456-426614174000',
					name: 'Coffee Maker',
					isTaken: true,
					takenBy: 'John Doe'
				}
			}
		}
	},

	{
		method: 'POST',
		path: '/api/gifts/{id}/reserve',
		summary: 'Reserve a gift (alternative endpoint)',
		description:
			'Alternative endpoint for reserving gifts. Same functionality as PATCH /api/gifts/{id}.',
		tags: ['Public', 'Gifts'],
		auth: 'none',
		requestBody: ReserveGiftSchema.omit({ action: true }),
		responseBody: SuccessResponseSchema
	},

	// Admin Endpoints
	{
		method: 'GET',
		path: '/api/admin/gifts',
		summary: 'List all gifts (admin)',
		description:
			'Retrieve all gifts with full administrative access, including private information.',
		tags: ['Admin', 'Gifts'],
		auth: 'admin',
		queryParams: QueryParamsSchema,
		responseBody: z.object({
			gifts: z.array(AdminGiftSchema),
			total: z.number(),
			available: z.number(),
			taken: z.number(),
			requestedBy: z.string(),
			timestamp: z.string().datetime()
		})
	},

	{
		method: 'POST',
		path: '/api/admin/gifts',
		summary: 'Create a new gift',
		description: 'Create a new gift entry. Only administrators can create gifts.',
		tags: ['Admin', 'Gifts'],
		auth: 'admin',
		requestBody: CreateGiftSchema,
		responseBody: z.object({
			gift: AdminGiftSchema,
			createdBy: z.string(),
			timestamp: z.string().datetime()
		}),
		examples: {
			request: {
				name: 'Smart Watch',
				description: 'Latest smartwatch with health tracking',
				imagePath: '/images/smartwatch.jpg',
				approximatePrice: 399.99,
				currency: 'EUR',
				purchaseLinks: [{ siteName: 'Apple Store', url: 'https://apple.com/watch' }]
			}
		}
	},

	{
		method: 'GET',
		path: '/api/admin/gifts/{id}',
		summary: 'Get gift details (admin)',
		description:
			'Retrieve full gift details including private information, administrative metadata.',
		tags: ['Admin', 'Gifts'],
		auth: 'admin',
		responseBody: z.object({
			gift: AdminGiftSchema,
			requestedBy: z.string(),
			timestamp: z.string().datetime()
		})
	},

	{
		method: 'PUT',
		path: '/api/admin/gifts/{id}',
		summary: 'Update a gift',
		description: 'Update gift properties. All fields are optional.',
		tags: ['Admin', 'Gifts'],
		auth: 'admin',
		requestBody: UpdateGiftSchema,
		responseBody: z.object({
			gift: AdminGiftSchema,
			updatedBy: z.string(),
			timestamp: z.string().datetime()
		})
	},

	{
		method: 'DELETE',
		path: '/api/admin/gifts/{id}',
		summary: 'Delete a gift',
		description: 'Permanently delete a gift. This action cannot be undone.',
		tags: ['Admin', 'Gifts'],
		auth: 'admin',
		responseBody: z.object({
			success: z.boolean(),
			deletedGift: z.object({
				id: z.string(),
				name: z.string()
			}),
			deletedBy: z.string(),
			timestamp: z.string().datetime()
		})
	},

	{
		method: 'PATCH',
		path: '/api/admin/gifts/{id}',
		summary: 'Admin actions on gifts',
		description: 'Perform administrative actions like unreserving gifts.',
		tags: ['Admin', 'Gifts'],
		auth: 'admin',
		requestBody: AdminActionSchema,
		responseBody: z.object({
			success: z.boolean(),
			gift: PublicGiftSchema,
			message: z.string(),
			unreservedBy: z.string(),
			timestamp: z.string().datetime()
		}),
		examples: {
			request: { action: 'unreserve' },
			response: {
				success: true,
				message: 'Successfully unreserved "Coffee Maker"',
				unreservedBy: 'admin',
				timestamp: '2025-01-01T00:00:00Z'
			}
		}
	}
];
