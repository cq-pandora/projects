export interface BreadsRaw {
	status: string;
	bread: Bread[];
}

export interface Bread {
	name: string;
	rarity: Rarity;
	grade: number;
	trainpoint: number;
	critprob: number;
	image: string;
	sellprice: number;
	id: string;
}

export enum Rarity {
	Common = 'COMMON',
	Epic = 'EPIC',
	Legendary = 'LEGENDARY',
	Rare = 'RARE',
}
