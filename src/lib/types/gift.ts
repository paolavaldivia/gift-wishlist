export interface Gift {
	id: string;
	name: string;
	description: string;
	imagePath: string;
	approximatePrice: number;
	currency: string;
	purchaseLinks: PurchaseLink[];
	isTaken: boolean;
	takenBy?: string | null;
}

export interface PurchaseLink {
	siteName: string;
	url: string;
}

export interface BigGift extends Gift {
	targetAmount: number;
	currentAmount: number;
	contributors: Contributor[];
}

export interface Contributor {
	name: string;
	amount: number;
}
