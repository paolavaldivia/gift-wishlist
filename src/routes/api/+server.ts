import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = async () => {
	return json({
		name: 'Gift Registry API',
		version: '2.0.0',
		description: 'Modern gift registry API with privacy controls and type-safe endpoints',
		endpoints: {
			public: {
				// Gift browsing (public view with privacy applied)
				'GET /api/gifts': 'List all gifts (public view with privacy filtering)',
				'GET /api/gifts?filter=available': 'List available gifts only',
				'GET /api/gifts?filter=taken': 'List reserved gifts only',
				'GET /api/gifts?limit=10&offset=0': 'Paginated gift listing (max 100 per request)',
				'GET /api/gifts/[id]': 'Get specific gift details (privacy-filtered)',

				// Gift reservation (public actions)
				'POST /api/gifts/[id]/reserve': 'Reserve a gift with optional privacy',
				'PATCH /api/gifts/[id]': 'Reserve a gift (action: "reserve" only)'
			},
			admin: {
				// Gift management (full access)
				'GET /api/admin/gifts': 'List all gifts (admin view - full data)',
				'GET /api/admin/gifts?filter=available': 'List available gifts (admin view)',
				'GET /api/admin/gifts?filter=taken': 'List reserved gifts (admin view)',
				'GET /api/admin/gifts?includePrivate=true': 'Include private reserver info',
				'POST /api/admin/gifts': 'Create new gift',
				'GET /api/admin/gifts/[id]': 'Get gift details (admin view - full data)',
				'PUT /api/admin/gifts/[id]': 'Update gift properties',
				'DELETE /api/admin/gifts/[id]': 'Delete gift permanently',
				'PATCH /api/admin/gifts/[id]': 'Admin actions (unreserve gifts)',

				// System management
				'GET /api/admin/seed': 'Seed database with sample data',
				'POST /api/admin/tokens': 'Generate API tokens for integrations'
			},
			bigGifts: {
				// Community gifts (pooled contributions)
				'GET /api/big-gifts': 'List all big gifts with contributors',
				'POST /api/big-gifts': 'Create new big gift (admin only)',
				'GET /api/big-gifts/[id]': 'Get big gift with contribution details',
				'POST /api/big-gifts/[id]/contribute': 'Add contribution to big gift'
			}
		},
		requestBodies: {
			reserveGift: {
				description: 'Reserve a gift',
				example: {
					takenBy: 'John Doe',
					hideReserverName: false
				}
			},
			createGift: {
				description: 'Create a new gift (admin only)',
				example: {
					name: 'Coffee Maker',
					description: 'High-quality espresso machine',
					imagePath: '/images/coffee-maker.jpg',
					approximatePrice: 299.99,
					currency: 'EUR',
					purchaseLinks: [
						{
							siteName: 'Amazon',
							url: 'https://amazon.com/...'
						}
					]
				}
			},
			updateGift: {
				description: 'Update gift properties (admin only)',
				example: {
					name: 'Updated Coffee Maker',
					approximatePrice: 249.99,
					isTaken: false
				}
			},
			adminAction: {
				description: 'Admin actions on gifts',
				example: {
					action: 'unreserve'
				}
			}
		},
		responses: {
			publicGift: {
				description: 'Public gift object with privacy applied',
				example: {
					id: 'uuid-here',
					name: 'Coffee Maker',
					description: 'High-quality espresso machine',
					imagePath: '/images/coffee-maker.jpg',
					approximatePrice: 299.99,
					currency: 'EUR',
					purchaseLinks: [
						{
							siteName: 'Amazon',
							url: 'https://amazon.com/...'
						}
					],
					isTaken: true,
					takenBy: 'John D.', // null if hideReserverName is true
					isAnonymous: false, // true if reserver name is hidden
					createdAt: '2025-01-01T00:00:00Z',
					updatedAt: '2025-01-01T00:00:00Z'
				}
			},
			adminGift: {
				description: 'Admin gift object with full data access',
				example: {
					id: 'uuid-here',
					name: 'Coffee Maker',
					description: 'High-quality espresso machine',
					imagePath: '/images/coffee-maker.jpg',
					approximatePrice: 299.99,
					currency: 'EUR',
					purchaseLinks: [
						{
							siteName: 'Amazon',
							url: 'https://amazon.com/...'
						}
					],
					isTaken: true,
					takenBy: 'John Doe', // Always shown for admin
					hideReserverName: true, // Privacy setting
					createdAt: '2025-01-01T00:00:00Z',
					updatedAt: '2025-01-01T00:00:00Z'
				}
			},
			giftsList: {
				description: 'Paginated list of gifts with metadata',
				example: {
					gifts: [], // Array of gift objects
					pagination: {
						total: 42,
						limit: 10,
						offset: 0,
						hasMore: true
					},
					stats: {
						total: 42,
						available: 25,
						taken: 17
					}
				}
			}
		},
		authentication: {
			public: {
				description: 'No authentication required',
				access: 'Read-only access to gifts with privacy filtering, gift reservation'
			},
			admin: {
				description: 'Requires admin session cookie or Bearer token',
				cookieAuth: 'Set admin_session cookie via /admin login',
				bearerAuth: 'Authorization: Bearer <jwt-token>',
				access: 'Full CRUD operations, unreserve gifts, view private data'
			}
		},
		features: {
			privacy: {
				description: 'Built-in privacy controls',
				capabilities: [
					'Hide reserver names from public view',
					'Anonymous gift reservations',
					'Admin override to view all data'
				]
			},
			typesSafety: {
				description: 'Full TypeScript support',
				capabilities: [
					'Strong typing for all endpoints',
					'Automatic JSON validation',
					'Type-safe database operations'
				]
			},
			security: {
				description: 'Enterprise-grade security',
				capabilities: [
					'JWT-based admin authentication',
					'Input validation with Zod schemas',
					'CSRF protection for forms',
					'XSS prevention'
				]
			}
		},
		currencies: ['EUR', 'USD', 'PEN'],
		limits: {
			giftNameLength: 100,
			descriptionLength: 1000,
			reserverNameLength: 100,
			paginationMaxLimit: 100,
			paginationDefaultLimit: 50
		}
	});
};
