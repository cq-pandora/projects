export interface PortraitsRaw {
	status: string;
	illust_collection: IllustCollection[];
}

export interface IllustCollection {
	illusttype: Illusttype;
	priority: number;
	name: string;
	ishidden: boolean;
	class: Class;
	facetex: string;
	subnumber: number | null;
	portrait_1: string;
	unlockillustid_1: string[];
	isvisibleportraitforpanho_1: string;
	portrait_2: null | string;
	unlockillustid_2: string[] | null;
	isvisibleportraitforpanho_2: string;
	portrait_3: null | string;
	unlockillustid_3: string[] | null | string;
	isvisibleportraitforpanho_3: string;
	id: string;
}

export enum Class {
	ClaArcher = 'CLA_ARCHER',
	ClaChamp = 'CLA_CHAMP',
	ClaHunter = 'CLA_HUNTER',
	ClaNpc = 'CLA_NPC',
	ClaPaladin = 'CLA_PALADIN',
	ClaPriest = 'CLA_PRIEST',
	ClaSister = 'CLA_SISTER',
	ClaWarrior = 'CLA_WARRIOR',
	ClaWizard = 'CLA_WIZARD',
}

export enum Illusttype {
	Champ = 'CHAMP',
	Collabo = 'COLLABO',
	Enemy = 'ENEMY',
	Hero = 'HERO',
	Npc = 'NPC',
	Sister = 'SISTER',
}
