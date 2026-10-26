import {
	autoserializeAs, autoserialize, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { registerSerializer } from './Serializer';

// Champion Bond (added Jun 2020): one shared level table for every faction
export interface IChampionBondLevelOptions {
	level: number;
	exp: number;
	hp: number;
	atkPower: number;
	critChance: number;
	critDmg: number;
}

// Stats every hero of the faction gets at this bond level
export class ChampionBondLevel {
	@autoserialize public readonly level!: number;
	// Bond experience needed to reach the next level
	@autoserialize public readonly exp!: number;
	@autoserialize public readonly hp!: number;
	@autoserializeAs('atk_power') public readonly atkPower!: number;
	@autoserializeAs('crit_chance') public readonly critChance!: number;
	@autoserializeAs('crit_dmg') public readonly critDmg!: number;

	constructor(options: IChampionBondLevelOptions) {
		if (!options) return; // for tests and serializer

		this.level = options.level;
		this.exp = options.exp;
		this.hp = options.hp;
		this.atkPower = options.atkPower;
		this.critChance = options.critChance;
		this.critDmg = options.critDmg;
	}
}

export interface IChampionBondSkillOptions {
	id: string;
	name: string;
	description: string;
	image: string;
	level: number;
	requiredHeroes: number;
	requiredHeroType: string;
	requiredInheritance: number;
}

// Bond skill learned on reaching `level`; reaching it requires sending heroes of the faction
export class ChampionBondSkill {
	@autoserialize public readonly id!: string;
	@autoserialize public readonly name!: string;
	@autoserialize public readonly description!: string;
	@autoserialize public readonly image!: string;
	@autoserialize public readonly level!: number;
	@autoserializeAs('required_heroes') public readonly requiredHeroes!: number;
	@autoserializeAs('required_hero_type') public readonly requiredHeroType!: string;
	@autoserializeAs('required_inheritance') public readonly requiredInheritance!: number;

	constructor(options: IChampionBondSkillOptions) {
		if (!options) return; // for tests and serializer

		this.id = options.id;
		this.name = options.name;
		this.description = options.description;
		this.image = options.image;
		this.level = options.level;
		this.requiredHeroes = options.requiredHeroes;
		this.requiredHeroType = options.requiredHeroType;
		this.requiredInheritance = options.requiredInheritance;
	}
}

export interface IChampionBondOptions {
	levels: ChampionBondLevel[];
	skills: ChampionBondSkill[];
}

export class ChampionBond {
	@autoserializeAs(ChampionBondLevel) public readonly levels!: ChampionBondLevel[];
	@autoserializeAs(ChampionBondSkill) public readonly skills!: ChampionBondSkill[];

	constructor(options: IChampionBondOptions) {
		if (!options) return; // for tests and serializer

		this.levels = options.levels;
		this.skills = options.skills;
	}
}

registerDeserializer(ChampionBond, (input: string) => Deserialize(JSON.parse(input), ChampionBond));
registerSerializer(
	ChampionBond,
	(input: ChampionBond | ChampionBond[]) => Serialize(Array.isArray(input) ? input[0] : input, ChampionBond),
);
