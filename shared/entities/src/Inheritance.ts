import {
	autoserializeAs, autoserialize, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { registerSerializer } from './Serializer';
import { IStatsHolder } from './interfaces';
import { HeroClass } from './hero';

export const MAX_INHERITANCE = 40;

export type InheritanceLevel = 0 |
1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 |
31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40;

export function isInheritanceLevel(inp: number | string): inp is InheritanceLevel {
	const res = parseInt(inp as string, 10);
	return res >= 1 && res <= MAX_INHERITANCE;
}

export interface IInheritanceStatsOptions {
	accuracy: number;
	armor: number;
	armorPenetration: number;
	atkPower: number;
	critChance: number;
	critChanceReduction: number;
	critDmg: number;
	dmgReduction: number;
	evasion: number;
	hp: number;
	lifesteal: number;
	resistance: number;
	resistancePenetration: number;
}

export class InheritanceStats implements IStatsHolder {
	readonly all: number = -1;
	@autoserialize public readonly accuracy!: number;
	@autoserialize public readonly armor!: number;
	@autoserializeAs('armor_pen') public readonly armorPenetration!: number;
	@autoserializeAs('atk_power') public readonly atkPower!: number;
	@autoserializeAs('crit_chance') public readonly critChance!: number;
	@autoserializeAs('crit_chance_reduction') public readonly critChanceReduction!: number;
	@autoserializeAs('crit_dmg') public readonly critDmg!: number;
	@autoserializeAs('dmg_reduction') public readonly dmgReduction!: number;
	@autoserialize public readonly evasion!: number;
	@autoserialize public readonly hp!: number;
	@autoserialize public readonly lifesteal!: number;
	@autoserialize public readonly resistance!: number;
	@autoserializeAs('resistance_pen') public readonly resistancePenetration!: number;

	constructor(options: IInheritanceStatsOptions) {
		if (!options) return; // only for tests

		this.accuracy = options.accuracy;
		this.armor = options.armor;
		this.armorPenetration = options.armorPenetration;
		this.atkPower = options.atkPower;
		this.critChance = options.critChance;
		this.critChanceReduction = options.critChanceReduction;
		this.critDmg = options.critDmg;
		this.dmgReduction = options.dmgReduction;
		this.evasion = options.evasion;
		this.hp = options.hp;
		this.lifesteal = options.lifesteal;
		this.resistance = options.resistance;
		this.resistancePenetration = options.resistancePenetration;
	}
}

type InheritanceStatsRaw = {
	// eslint-disable-next-line camelcase
	atk_power: number;
	hp: number;
	// eslint-disable-next-line camelcase
	crit_chance: number;
	armor: number;
	resistance: number;
	// eslint-disable-next-line camelcase
	crit_dmg: number;
	accuracy: number;
	evasion: number;
	// eslint-disable-next-line camelcase
	armor_pen: number;
	// eslint-disable-next-line camelcase
	resistance_pen: number;
	// eslint-disable-next-line camelcase
	dmg_reduction: number;
	lifesteal: number;
	// eslint-disable-next-line camelcase
	crit_chance_reduction: number;
};

type InheritanceStructure<S> = {
	[C in HeroClass]: S;
};

type InheritanceLevelsStructure<H> = {
	[I in InheritanceLevel]: H;
};

type InheritanceLevelsRaw = InheritanceLevelsStructure<InheritanceStatsRaw>;
type InheritanceRaw = InheritanceStructure<InheritanceLevelsRaw>;

export type InheritanceLevels = InheritanceLevelsStructure<InheritanceStats>;
export type Inheritance = InheritanceStructure<InheritanceLevels>;

function parseInheritance(rawJson: string): Inheritance {
	const json = JSON.parse(rawJson) as InheritanceRaw;

	return Object.entries(json).reduce<Inheritance>(
		(re, [classRaw, rawLevels]: [string, InheritanceLevelsRaw]) => {
			const heroClass: HeroClass = classRaw as HeroClass;

			re[heroClass] = Object.entries(rawLevels).reduce<InheritanceLevels>(
				(levels, [levelRaw, statsRaw]) => {
					if (!isInheritanceLevel(levelRaw)) {
						return levels;
					}

					levels[levelRaw as InheritanceLevel] = Deserialize(statsRaw, InheritanceStats);

					return levels;
				}, {} as InheritanceLevels
			);

			return re;
		}, {} as Inheritance
	);
}

function serializeInheritance(inheritance: Inheritance | Inheritance[]): object {
	const target = Array.isArray(inheritance) ? inheritance[0] : inheritance;

	return Object.entries(target).reduce(
		(res, current) => {
			const [heroClass, levels] = current;

			res[heroClass] = Object.entries(levels).reduce(
				(re, curr) => {
					const [level, stats] = curr;

					re[level] = Serialize(stats, InheritanceStats);

					return re;
				},
				{} as Record<string, object>
			);

			return res;
		},
		{} as Record<string, object>
	);
}

registerDeserializer('Inheritance', parseInheritance);
registerSerializer('Inheritance', serializeInheritance);
