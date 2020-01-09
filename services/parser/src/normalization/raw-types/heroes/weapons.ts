export interface WeaponsRaw {
	status: string;
	weapon: Weapon[];
}

export interface Weapon {
	name: null | string;
	desc: null | string;
	classid: WeaponClassID;
	image: null | string;
	grade: number;
	attdmg: number;
	attspd: number;
	range: number;
	type: Type;
	convert_slot_1: ConvertSlot;
	convert_slot_2: ConvertSlot;
	convert_slot_3: ConvertSlot;
	upgradetargetweapon: null | string;
	rarity: Rarity;
	howtoget: Howtoget[] | null;
	reqhero_ref: null | string;
	resourcetype: null | string;
	weaponaccid: string[] | null;
	showacconly: boolean;
	id: string;
}

export enum WeaponClassID {
	CatBow = 'CAT_BOW',
	CatGun = 'CAT_GUN',
	CatHammer = 'CAT_HAMMER',
	CatORB = 'CAT_ORB',
	CatStaff = 'CAT_STAFF',
	CatSword = 'CAT_SWORD',
}

enum ConvertSlot {
	Attack = 'ATTACK',
	Defense = 'DEFENSE',
	Exclusive = 'EXCLUSIVE',
	None = 'NONE',
	Random = 'RANDOM',
	Utility = 'UTILITY',
}

enum Howtoget {
	Doc = 'DOC',
	Event = 'EVENT',
	ExclusiveWeaponBox = 'EXCLUSIVE_WEAPON_BOX',
	ExclusiveWeaponSelect = 'EXCLUSIVE_WEAPON_SELECT',
	Gradeup = 'GRADEUP',
	Hidden = 'HIDDEN',
	Orchard = 'ORCHARD',
	StageDesert24 = 'STAGE_DESERT_24',
	StageForest1 = 'STAGE_FOREST_1',
	StageSea24 = 'STAGE_SEA_24',
	StageTundra1 = 'STAGE_TUNDRA_1',
	StageTundra4 = 'STAGE_TUNDRA_4',
	StageTundra5 = 'STAGE_TUNDRA_5',
	StageVolcano2 = 'STAGE_VOLCANO_2',
	StageVolcano24 = 'STAGE_VOLCANO_24',
	StageVolcano4 = 'STAGE_VOLCANO_4',
	StageVolcano9 = 'STAGE_VOLCANO_9',
	Unknown = 'UNKNOWN',
	WeaponGacha = 'WEAPON_GACHA',
	Worldboss = 'WORLDBOSS',
}

enum Rarity {
	Antique = 'ANTIQUE',
	Collabo = 'COLLABO',
	Direction = 'DIRECTION',
	Exclusive = 'EXCLUSIVE',
	Hidden = 'HIDDEN',
	Normal = 'NORMAL',
	Resource = 'RESOURCE',
}

enum Type {
	Basic = 'BASIC',
	Hero = 'HERO',
	Monster = 'MONSTER',
}
