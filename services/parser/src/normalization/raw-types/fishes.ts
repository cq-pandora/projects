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
	sellvalue: Sellvalue;
	sellamount: number;
	selltype_2nd: null | string;
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
	ItemRandombox = 'ITEM_RANDOMBOX',
}

export enum Sellvalue {
	ItemFishcoin = 'ITEM_FISHCOIN',
	ItemGold = 'ITEM_GOLD',
	RandomboxEventChristmas2018 = 'RANDOMBOX_EVENT_CHRISTMAS_2018',
	RandomboxEventGoodCatbox = 'RANDOMBOX_EVENT_GOOD_CATBOX',
	RandomboxEventGoodCatboxT2 = 'RANDOMBOX_EVENT_GOOD_CATBOX_T2',
	RandomboxEventNormalCatbox = 'RANDOMBOX_EVENT_NORMAL_CATBOX',
	RandomboxEventNormalCatboxT2 = 'RANDOMBOX_EVENT_NORMAL_CATBOX_T2',
}

export enum Type {
	Event = 'EVENT',
	Fish = 'FISH',
	Junk = 'JUNK',
}
