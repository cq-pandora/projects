export interface FishingGearRaw {
	status: string;
	fishing_gear: FishingGear[];
}

export interface FishingGear {
	id: string;
	type: Type;
	name: string;
	desc: string;
	level: number;
	habitat: Habitat;
	habitatvalue: number;
	addgrade: number;
	addrarity: number;
	addrarityevent: number;
	addlength: number;
	addbite: number;
	atk: number;
	buylevel: number;
	geartexture: string;
	acctexture: string;
	cost_type: Cost;
	cost_value: Cost;
	cost_amount: number;
	bulktype: boolean;
	howtoget: Howtoget;
}

export enum Cost {
	ItemFishcoin = 'ITEM_FISHCOIN',
	ItemGold = 'ITEM_GOLD',
	ItemHonor = 'ITEM_HONOR',
	ItemJewel = 'ITEM_JEWEL',
}

export enum Habitat {
	Event = 'EVENT',
	Freshwater = 'FRESHWATER',
	Sea = 'SEA',
}

export enum Howtoget {
	Collection = 'COLLECTION',
	Event = 'EVENT',
	None = 'NONE',
	Shop = 'SHOP',
}

export enum Type {
	ItemBait = 'ITEM_BAIT',
	ItemFloat = 'ITEM_FLOAT',
	ItemRod = 'ITEM_ROD',
}
