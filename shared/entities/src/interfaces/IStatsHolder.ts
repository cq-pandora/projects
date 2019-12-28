import { Stats } from '../common-types';

export default interface IStatsHolder extends Record<Stats, number>{
	all: number;
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
