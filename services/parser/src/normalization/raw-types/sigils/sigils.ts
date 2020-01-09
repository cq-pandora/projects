export interface SigilsRaw {
	status: string;
	carve_stone: CarveStone[];
}

export interface CarveStone {
	name: string;
	desc: string;
	image: string;
	grade: number;
	raritytype: Raritytype;
	priority: number;
	cost_type: CostType;
	cost_value: CostType;
	cost_amount: number;
	sell_reward_type: CostType;
	sell_reward_value: CostType;
	sell_reward_amount: number;
	unequip_cost_type: CostType;
	unequip_cost_value: CostType;
	unequip_cost_amount: number;
	optionidjson: string[];
	setid: null | string;
	howtogetjson: Howtogetjson[];
	id: string;
}

export enum CostType {
	ItemGold = 'ITEM_GOLD',
}

export interface Howtogetjson {
	type: Type;
	key: string;
	shortcut?: Shortcut;
}

export enum Shortcut {
	StageRAIDGuardianofruins1 = 'STAGE_RAID_GUARDIANOFRUINS_1',
	StageRAIDGuardianofruins2 = 'STAGE_RAID_GUARDIANOFRUINS_2',
	StageRAIDGuardianofruins3 = 'STAGE_RAID_GUARDIANOFRUINS_3',
	StageRAIDGuardianofruins4 = 'STAGE_RAID_GUARDIANOFRUINS_4',
	StageRAIDSealofsanctuary1 = 'STAGE_RAID_SEALOFSANCTUARY_1',
	StageRAIDSealofsanctuary2 = 'STAGE_RAID_SEALOFSANCTUARY_2',
	StageRAIDSealofsanctuary3 = 'STAGE_RAID_SEALOFSANCTUARY_3',
	StageRAIDSealofsanctuary4 = 'STAGE_RAID_SEALOFSANCTUARY_4',
	StageS2Ep1Challenge1 = 'STAGE_S2_EP1_CHALLENGE_1',
	StageS2Ep1Challenge2 = 'STAGE_S2_EP1_CHALLENGE_2',
	StageS2Ep1Challenge3 = 'STAGE_S2_EP1_CHALLENGE_3',
	StageS2Ep1Challenge4 = 'STAGE_S2_EP1_CHALLENGE_4',
	StageS2Ep2Challenge1 = 'STAGE_S2_EP2_CHALLENGE_1',
	StageS2Ep2Challenge2 = 'STAGE_S2_EP2_CHALLENGE_2',
	StageS2Ep2Challenge3 = 'STAGE_S2_EP2_CHALLENGE_3',
	StageS2Ep3Challenge1 = 'STAGE_S2_EP3_CHALLENGE_1',
	StageS2Ep3Challenge2 = 'STAGE_S2_EP3_CHALLENGE_2',
	StageS2Ep3Challenge3 = 'STAGE_S2_EP3_CHALLENGE_3',
}

export enum Type {
	ItemHero = 'ITEM_HERO',
	ItemRandombox = 'ITEM_RANDOMBOX',
}

export enum Raritytype {
	Common = 'COMMON',
	Epic = 'EPIC',
	Rare = 'RARE',
	Set = 'SET',
	Unique = 'UNIQUE',
}
