import { Stats } from '../common-types';

export default interface IStatsHolder extends Record<Stats, number>{
	readonly all: number;
	readonly accuracy: number;
	readonly armor: number;
	readonly armorPenetration: number;
	readonly atkPower: number;
	readonly critChance: number;
	readonly critChanceReduction: number;
	readonly critDmg: number;
	readonly dmgReduction: number;
	readonly evasion: number;
	readonly hp: number;
	readonly lifesteal: number;
	readonly resistance: number;
	readonly resistancePenetration: number;
}
