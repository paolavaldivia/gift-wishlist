import { createD1Client } from '$lib/server/db/config';
import type { RequestHandler } from '@sveltejs/kit';
import { reset, seed } from 'drizzle-seed';
import { bigGifts, contributors, currencies, gifts } from '$lib/server/db/schema';

export const prerender = false;

type DatabaseInstance = App.Locals['db'];

async function seedDatabase(db: DatabaseInstance) {
	await reset(db, { bigGifts, contributors, gifts });
	await seed(db, { bigGifts, contributors, gifts }).refine((f) => ({
		bigGifts: {
			// currency valid only
			columns: {
				currency: f.valuesFromArray({ values: currencies as unknown as string[] })
			}
		},
		contributors: {},
		gifts: {
			// currency valid only
			columns: {
				purchaseLinks: f.valuesFromArray({
					values: [
						JSON.stringify([
							{ siteName: 'Amazon', url: 'https://amazon.fr/sophie-girafe' },
							{ siteName: 'La Grande Récré', url: 'https://lagranderecre.fr/sophie' }
						]),
						JSON.stringify([
							{ siteName: 'Bébé9', url: 'https://bebe9.com/veilleuse' },
							{ siteName: 'Aubert', url: 'https://aubert.com/veilleuse-musicale' }
						]),
						JSON.stringify([
							{ siteName: 'Petit Bateau', url: 'https://petit-bateau.fr/coffret' },
							{ siteName: 'Jacadi', url: 'https://jacadi.fr/naissance' }
						]),
						JSON.stringify([
							{ siteName: 'Nature & Découvertes', url: 'https://natureetdecouvertes.com/mobile' }
						]),
						JSON.stringify([
							{ siteName: 'Oxybul', url: 'https://oxybul.com/livre-tissu' },
							{ siteName: 'Cultura', url: 'https://cultura.com/eveil-bebe' }
						]),
						JSON.stringify([{ siteName: 'Pharmacie', url: '#' }])
					]
				}),
				imagePath: f.valuesFromArray({
					values: [
						'https://picsum.photos/600/400?random=1',
						'https://picsum.photos/600/400?random=2',
						'https://picsum.photos/600/400?random=3'
					]
				}),
				currency: f.valuesFromArray({ values: currencies as unknown as string[] }),
				approximatePrice: f.int({ minValue: 1, maxValue: 100 })
			}
		}
	}));
}

export const GET: RequestHandler = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return new Response('Database not available', { status: 500 });
	}

	const db = createD1Client(platform.env.DB);
	try {
		await seedDatabase(db);
		return new Response('Database seeded successfully!', { status: 200 });
	} catch (err) {
		console.error('Failed to seed database:', err);
		return new Response(`Failed to seed database: ${err}`, { status: 500 });
	}
};
