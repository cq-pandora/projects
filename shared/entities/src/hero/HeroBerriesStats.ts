import { autoserializeAs, autoserialize } from 'cerialize';

import { IStatsHolder } from '../interfaces';

export interface IHeroBerriesStats {
	accuracy: number;
	armor: number;
	atkPower: number;
	critChance: number;
	critDmg: number;
	evasion: number;
	hp: number;
	resistance: number;
}

export class HeroBerriesStats implements IStatsHolder {
	@autoserialize public readonly accuracy: number;
	@autoserialize public readonly armor: number;
	@autoserializeAs('atk_power') public readonly atkPower: number;
	@autoserializeAs('crit_chance') public readonly critChance: number;
	@autoserializeAs('crit_dmg') public readonly critDmg: number;
	@autoserialize public readonly evasion: number;
	@autoserialize public readonly hp: number;
	@autoserialize public readonly resistance: number;
	public readonly armorPenetration = 0;
	public readonly critChanceReduction = 0;
	public readonly lifesteal = 0;
	public readonly resistancePenetration = 0;
	public readonly all = 0;
	public readonly dmgReduction = 0;

	constructor(options: IHeroBerriesStats) {
		this.accuracy = options.accuracy;
		this.armor = options.armor;
		this.atkPower = options.atkPower;
		this.critChance = options.critChance;
		this.critDmg = options.critDmg;
		this.evasion = options.evasion;
		this.hp = options.hp;
		this.resistance = options.resistance;
	}
}
