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

export interface BigGift extends Gift {
	targetAmount: number;
	currentAmount: number;
	contributors: Contributor[];
}

export interface Contributor {
	id: string;
	name: string;
	amount: number;
	email?: string;
	message?: string;
	hideContributorName?: boolean;
	createdAt: Date;
}
