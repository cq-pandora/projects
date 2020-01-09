export interface InheritanceRaw {
	status: string;
	character_epic_level_stat: CharacterEpicLevelStat[];
}

export interface CharacterEpicLevelStat {
	class: Class;
	epiclevel: number;
	atkpower: number;
	maxhp: number;
	def: number;
	rst: number;
	critrate: number;
	critpowerrate: number;
	accuracyrate: number;
	dodgerate: number;
	penetratedef: number;
	penetraterst: number;
	receivedmgrate: number;
	vamprate: number;
	atkspd: number;
	critdodgerate: number;
	id: string;
}

export enum Class {
	ClaArcher = 'CLA_ARCHER',
	ClaHunter = 'CLA_HUNTER',
	ClaPaladin = 'CLA_PALADIN',
	ClaPriest = 'CLA_PRIEST',
	ClaWarrior = 'CLA_WARRIOR',
	ClaWizard = 'CLA_WIZARD',
}
