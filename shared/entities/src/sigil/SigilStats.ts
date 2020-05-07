import { autoserialize, autoserializeAs } from 'cerialize';

import { IStatsHolder } from '../interfaces';

export type ISigilStatsOptions = IStatsHolder;

export class SigilStats implements IStatsHolder {
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

	constructor(stats: ISigilStatsOptions) {
		if (!stats) return; // only for tests

		this.accuracy = stats.accuracy;
		this.armor = stats.armor;
		this.armorPenetration = stats.armorPenetration;
		this.atkPower = stats.atkPower;
		this.critChance = stats.critChance;
		this.critChanceReduction = stats.critChanceReduction;
		this.critDmg = stats.critDmg;
		this.dmgReduction = stats.dmgReduction;
		this.evasion = stats.evasion;
		this.hp = stats.hp;
		this.lifesteal = stats.lifesteal;
		this.resistance = stats.resistance;
		this.resistancePenetration = stats.resistancePenetration;
	}
}
