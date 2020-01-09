export interface ChampionSkillsRaw {
	status: string;
	champion_skill: ChampionSkill[];
}

export interface ChampionSkill {
	type: Type;
	level: number;
	name: string;
	desc: string;
	skillicon: string;
	delaytime: number;
	limittime: number;
	limitcount: number;
	pauseduration: number;
	skillhandlerjson: Skillhandlerjson[];
	backgroundvfx: null | string;
	id: string;
}

export interface Skillhandlerjson {
	id?: string;
	target?: EffectFrom;
	'target.partyonly'?: boolean;
	'skill.name'?: string;
	'skill.power'?: number[] | number;
	label?: string;
	'string.value'?: string;
	Comment?: string;
	'buff.type'?: BuffType;
	value?: number;
	duration?: number;
	'anti.cleanse'?: boolean;
	'anti.resist'?: boolean;
	'active.time'?: number;
	'effect.target'?: EffectFrom;
	vfx?: string;
	'unit.type'?: string;
	'effect.from'?: EffectFrom;
	'is.owner'?: boolean;
	'ignore.buffspeed'?: boolean;
	'value.target'?: string;
	'dmg.type'?: string;
	'value.greater'?: number;
}

export enum BuffType {
	None = 'NONE',
}

export enum EffectFrom {
	Ally = 'ALLY',
	Champion = 'CHAMPION',
	Leader = 'LEADER',
	Oneself = 'ONESELF',
}

export enum Type {
	Active = 'ACTIVE',
	Exclusive = 'EXCLUSIVE',
	ExclusivePassive = 'EXCLUSIVE_PASSIVE',
	Passive = 'PASSIVE',
}
