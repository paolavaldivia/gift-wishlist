export const currencies = ['EUR', 'USD', 'PEN'] as const;
export type Currency = (typeof currencies)[number];

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
	hideReserverName?: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface PurchaseLink {
	siteName: string;
	url: string;
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
	contributors: Contributor[];
}

export interface Contributor {
	id: string;
	name: string;
	amount: number;
	email?: string | null;
	message?: string | null;
	hideContributorName: boolean;
	createdAt: Date;
}
