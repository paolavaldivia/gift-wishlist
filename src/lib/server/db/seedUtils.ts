import { reset, seed } from 'drizzle-seed';
import { bigGifts, contributors, currencies, gifts } from './schema';

type DatabaseInstance = App.Locals['db'];

export async function seedDatabase(db: DatabaseInstance) {
	await reset(db, { gifts, bigGifts, contributors });
	await seed(
		db,
		{ gifts, bigGifts, contributors },
		{
			batchSize: 2,
			count: 5
		}
	).refine((f) => ({
		bigGifts: {
			columns: {
				currency: f.valuesFromArray({ values: currencies as unknown as string[] }),
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
					values: ['https://picsum.photos/600/400?random=3']
				}),
				targetAmount: f.int({ minValue: 10, maxValue: 100 }),
				currentAmount: f.int({ minValue: 0, maxValue: 130 })
			}
		},
		contributors: {
			columns: {
				amount: f.int({ minValue: 1, maxValue: 50 })
			}
		},
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
					values: ['https://picsum.photos/600/400?random=3']
				}),
				currency: f.valuesFromArray({ values: currencies as unknown as string[] }),
				approximatePrice: f.int({ minValue: 10, maxValue: 100 })
			}
		}
	}));
}
