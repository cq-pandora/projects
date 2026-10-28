export interface FishRaw {
	status: string;
	fish: Fish[];
}

export interface Fish {
	id: string;
	type: Type;
	habitat: Habitat;
	name: string;
	desc: string;
	texture: string;
	fbx: null;
	baselength: number;
	minlength: number;
	maxlength: number;
	rarity: number;
	size: number;
	exp: number;
	hp: number;
	selltype: Selltype;
	/** Item id for `ITEM_RANDOMBOX`/`ITEM_MATERIAL`, otherwise the currency itself */
	sellvalue: string;
	sellamount: number;
	selltype_2nd: null | Selltype;
	sellvalue_2nd: null | string;
	sellamount_2nd: number;
	rank: Rank;
}

export enum Habitat {
	Event = 'EVENT',
	Freshwater = 'FRESHWATER',
	Sea = 'SEA',
}

export enum Rank {
	Boss = 'BOSS',
	Event = 'EVENT',
	Eventbox = 'EVENTBOX',
	Hero = 'HERO',
	Normal = 'NORMAL',
}

export enum Selltype {
	ItemFishcoin = 'ITEM_FISHCOIN',
	ItemGold = 'ITEM_GOLD',
	ItemMaterial = 'ITEM_MATERIAL',
	ItemRandombox = 'ITEM_RANDOMBOX',
}

export enum Type {
	Event = 'EVENT',
	Fish = 'FISH',
	Junk = 'JUNK',
}
