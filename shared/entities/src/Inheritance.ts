import { autoserializeAs, autoserialize, Deserialize } from 'cerialize';

import { IStatsHolder } from './interfaces';
import { HeroClass } from './hero';

export type InheritanceLevel =
	1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
	11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
	21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30;

export function isInheritanceLevel(inp: number | string): inp is InheritanceLevel {
	const res = parseInt(inp as string, 0);
	return res >= 1 && res <= 30;
}

export class InheritanceStats implements IStatsHolder {
	@autoserialize public readonly accuracy: number;
	@autoserialize public readonly armor: number;
	@autoserializeAs('armor_pen') public readonly armorPenetration: number;
	@autoserializeAs('atk_power') public readonly atkPower: number;
	@autoserializeAs('crit_chance') public readonly critChance: number;
	@autoserializeAs('crit_chance_reduction') public readonly critChanceReduction: number;
	@autoserializeAs('crit_dmg') public readonly critDmg: number;
	@autoserializeAs('dmg_reduction') public readonly dmgReduction: number;
	@autoserialize public readonly evasion: number;
	@autoserialize public readonly hp: number;
	@autoserialize public readonly lifesteal: number;
	@autoserialize public readonly resistance: number;
	@autoserializeAs('resistance_pen') public readonly resistancePenetration: number;

	constructor(
		accuracy: number, armor: number, armorPenetration: number, atkPower: number, critChance: number,
		critChanceReduction: number, critDmg: number, dmgReduction: number, evasion: number, hp: number,
		lifesteal: number, resistance: number, resistancePenetration: number
	) {
		this.accuracy = accuracy;
		this.armor = armor;
		this.armorPenetration = armorPenetration;
		this.atkPower = atkPower;
		this.critChance = critChance;
		this.critChanceReduction = critChanceReduction;
		this.critDmg = critDmg;
		this.dmgReduction = dmgReduction;
		this.evasion = evasion;
		this.hp = hp;
		this.lifesteal = lifesteal;
		this.resistance = resistance;
		this.resistancePenetration = resistancePenetration;
	}
}

type InheritanceStatsRaw = {
	atk_power: number;
	hp: number;
	crit_chance: number;
	armor: number;
	resistance: number;
	crit_dmg: number;
	accuracy: number;
	evasion: number;
	armor_pen: number;
	resistance_pen: number;
	dmg_reduction: number;
	lifesteal: number;
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

export function parseInheritance(rawJson: string): Inheritance {
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

export type InheritanceLevels = InheritanceLevelsStructure<InheritanceStats>;
export type Inheritance = InheritanceStructure<InheritanceLevels>;
