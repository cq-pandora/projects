import { CharacterStat } from './character-stats';

export interface CharacterVisualRaw {
	status: string;
	character_visual: CharacterVisual[];
}

export interface CharacterVisual {
	default_stat_id: string;
	name: null | string;
	classid: string;
	skin_tex: string;
	face_tex: string;
	desc: null | string;
	ui_hpbar: null | string;
	ui_hpoffsety: number;
	overhead: number;
	bodywidth: number;
	bodyheight: number;
	type: Type;
	job: Job | null;
	rarity: Rarity;
	deadsound: Deadsound;
	drawmode: Drawmode | null;
	parts: string[] | null;
	upgradetargethero: null | string;
	howtoget: string[] | null;
	gender: Gender | null;
	portrait: null | string;
	season: number;
	species: Species | null;
	animationclipprefix: null | string;
	fixedweaponid: null | string;
	domain: Domain | null;
	isvisibleportraitforpanho: boolean | null;
	subnumber: number;
	ischaractercollectionhide: boolean;
	id: string;
	stats: CharacterStat;
}

export enum Deadsound {
	ManacarDead = 'MANACAR_DEAD',
	Normal = 'NORMAL',
	SndBsFugusDeath = 'SND_BS_FUGUS_DEATH',
	SndChaDie = 'SND_CHA_DIE',
	SndChampNOSDestroy = 'SND_CHAMP_NOS_DESTROY',
	SndDeadDragon = 'SND_DEAD_DRAGON',
	SndDeadGolem = 'SND_DEAD_GOLEM',
	SndDeadKraken = 'SND_DEAD_KRAKEN',
	SndDeadSandworm = 'SND_DEAD_SANDWORM',
	SndEp7ElDead = 'SND_EP7_EL_DEAD',
	SndEp7SisterWallDisappear = 'SND_EP7_SISTER_WALL_DISAPPEAR',
	SndMonDgRbGrimmDeath = 'SND_MON_DG_RB_GRIMM_DEATH',
}

export enum Domain {
	Chen = 'CHEN',
	East = 'EAST',
	Free = 'FREE',
	Goddess = 'GODDESS',
	Gran = 'GRAN',
	Han = 'HAN',
	Mino = 'MINO',
	NOS = 'NOS',
	Neth = 'NETH',
	Nonegroup = 'NONEGROUP',
	Pump = 'PUMP',
	Roman = 'ROMAN',
	West = 'WEST',
}

export enum Drawmode {
	CorruptedHero = 'CORRUPTED_HERO',
	CorruptedHero2 = 'CORRUPTED_HERO2',
	CorruptedHero3 = 'CORRUPTED_HERO3',
	CorruptedHeroRed = 'CORRUPTED_HERO_RED',
}

export enum Gender {
	Female = 'FEMALE',
	Male = 'MALE',
}

export enum Job {
	Animal = 'Animal',
	Hero = 'Hero',
	JobMan = 'man',
	Man = 'Man',
	ManKing = 'ManKing',
	ManKnight = 'ManKnight',
	Manknight = 'Manknight',
	Ninja = 'Ninja',
	Robot = 'Robot',
	Woman = 'Woman',
	WomanKnight = 'WomanKnight',
}

export enum Rarity {
	Collabo = 'COLLABO',
	Contract = 'CONTRACT',
	Hidden = 'HIDDEN',
	Legendary = 'LEGENDARY',
	Normal = 'NORMAL',
	Npc = 'NPC',
	Promotion = 'PROMOTION',
	Support = 'SUPPORT',
}

export enum Species {
	Animal = 'Animal',
	Robot = 'ROBOT',
}

export enum Type {
	Boss = 'BOSS',
	Hero = 'HERO',
	Hiddenboss = 'HIDDENBOSS',
	Monster = 'MONSTER',
	Npc = 'NPC',
	Object = 'OBJECT',
}
