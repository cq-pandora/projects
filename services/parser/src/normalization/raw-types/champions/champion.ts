export interface ChampionRaw {
	status: string;
	champion: Champion[];
}

export interface Champion {
	name: string;
	type: Type;
	background_textid: string;
	faceimage: string;
	lockvfx: string;
	unlockvfx: string;
	idlevfx: string;
	illust: string;
	portrait: string;
	portraitbackground: number[];
	portraitoffsetx: number;
	portraitoffsety: number;
	relatedstat: Relatedstat[];
	unlocktiming: number;
	id: string;
}

export enum Relatedstat {
	AtkDmg = 'AtkDmg',
	CritDmg = 'CRIT_DMG',
	CritProb = 'CRIT_PROB',
	Def = 'Def',
	Hitrate = 'HITRATE',
	PenetrateDef = 'PENETRATE_DEF',
	PenetrateRst = 'PENETRATE_RST',
	Rst = 'Rst',
}

export enum Type {
	Attack = 'ATTACK',
	Defence = 'DEFENCE',
	Utils = 'UTILS',
}
