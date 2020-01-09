export interface BerriesRaw {
	status: string;
	add_stat_item: AddStatItem[];
}

export interface AddStatItem {
	name: string;
	rarity: Rarity;
	type: string;
	addstatpoint: number;
	greatprob: number;
	grade: number;
	image: string;
	category: Category;
	sellprice: number;
	eatprice: number;
	typename: string;
	id: string;
}

export enum Category {
	All = 'All',
	Atk = 'Atk',
	Def = 'Def',
	Util = 'Util',
}

export enum Rarity {
	Common = 'COMMON',
	Epic = 'EPIC',
	Legendary = 'LEGENDARY',
	Rare = 'RARE',
}
