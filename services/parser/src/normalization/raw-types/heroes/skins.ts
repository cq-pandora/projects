export interface CharacterCostumesRaw {
	status: string;
	costume: Costume[];
}

export interface Costume {
	subnumber: number;
	class: Class;
	rarity: Rarity;
	categoryname: string;
	costumename: string;
	skin_tex: string;
	face_tex: string;
	parts: string[] | null;
	effectpostfix: null | string;
	weapon_tex: null;
	wearable_charid: string[];
	sellprice: number;
	addstatjson: CostumeStats[];
	id: string;
}

export interface CostumeStats {
	Type: CostumeStat;
	Value: number;
}

export enum CostumeStat {
	Accuracy = 'Accuracy',
	All = 'All',
	Armor = 'Armor',
	AttackPower = 'AttackPower',
	CriticalChance = 'CriticalChance',
	CriticalDamage = 'CriticalDamage',
	Dodge = 'Dodge',
	HP = 'HP',
	Resistance = 'Resistance',
}

export enum Class {
	ClaArcher = 'CLA_ARCHER',
	ClaHunter = 'CLA_HUNTER',
	ClaPaladin = 'CLA_PALADIN',
	ClaPriest = 'CLA_PRIEST',
	ClaWarrior = 'CLA_WARRIOR',
	ClaWizard = 'CLA_WIZARD',
}

export enum Rarity {
	Hidden = 'HIDDEN',
	Limited = 'LIMITED',
	Normal = 'NORMAL',
	Unsale = 'UNSALE',
}
