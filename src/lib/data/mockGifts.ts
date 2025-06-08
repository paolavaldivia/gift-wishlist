import type { Gift } from '$lib/types/gift';

export const mockGifts: Gift[] = [
	{
		id: '1',
		name: 'Sophie la Girafe',
		description: 'Le classique jouet de dentition que tous les bébés français adorent mâchouiller',
		imagePath: 'https://picsum.photos/600/400?random=1',
		approximatePrice: 25,
		currency: 'EUR',
		purchaseLinks: [
			{ siteName: 'Amazon', url: 'https://amazon.fr/sophie-girafe' },
			{ siteName: 'La Grande Récré', url: 'https://lagranderecre.fr/sophie' }
		],
		isTaken: false
	},
	{
		id: '2',
		name: 'Veilleuse Musicale Nuage',
		description: "Pour des nuits douces avec projection d'étoiles au plafond",
		imagePath: 'https://picsum.photos/600/400?random=1',
		approximatePrice: 45,
		currency: 'EUR',
		purchaseLinks: [
			{ siteName: 'Bébé9', url: 'https://bebe9.com/veilleuse' },
			{ siteName: 'Aubert', url: 'https://aubert.com/veilleuse-musicale' }
		],
		isTaken: true,
		takenBy: 'Tante Marie'
	},
	{
		id: '3',
		name: 'Coffret Naissance Bio',
		description: 'Ensemble body, pyjama et bonnet en coton bio tout doux',
		imagePath: 'https://picsum.photos/600/400?random=1',
		approximatePrice: 60,
		currency: 'EUR',
		purchaseLinks: [
			{ siteName: 'Petit Bateau', url: 'https://petit-bateau.fr/coffret' },
			{ siteName: 'Jacadi', url: 'https://jacadi.fr/naissance' }
		],
		isTaken: false
	},
	{
		id: '4',
		name: 'Mobile Musical Origami',
		description: 'Des grues en papier colorées qui dansent au-dessus du berceau',
		imagePath: 'https://picsum.photos/600/400?random=1',
		approximatePrice: 35,
		currency: 'EUR',
		purchaseLinks: [
			{ siteName: 'Nature & Découvertes', url: 'https://natureetdecouvertes.com/mobile' }
		],
		isTaken: true,
		takenBy: 'Les grands-parents'
	},
	{
		id: '5',
		name: "Livre d'éveil en tissu",
		description: 'Pages crissantes, textures variées et miroir caché pour stimuler bébé',
		imagePath: 'https://picsum.photos/600/400?random=1',
		approximatePrice: 20,
		currency: 'EUR',
		purchaseLinks: [
			{ siteName: 'Oxybul', url: 'https://oxybul.com/livre-tissu' },
			{ siteName: 'Cultura', url: 'https://cultura.com/eveil-bebe' }
		],
		isTaken: false
	},
	{
		id: '6',
		name: 'Thermomètre de bain Baleine',
		description: 'Pour que le bain soit toujours à la température parfaite',
		imagePath: 'https://picsum.photos/600/400?random=1',
		approximatePrice: 15,
		currency: 'EUR',
		purchaseLinks: [{ siteName: 'Pharmacie', url: '#' }],
		isTaken: false
	}
];
