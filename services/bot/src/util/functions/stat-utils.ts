import { Stats, HeroStats } from '@cquest/entities';

import toClearNumber from './toClearNumber';

export type StatsKey = Stats | HeroStats;

export type StatsKeyTranslations = Record<StatsKey, [string, boolean]>;

const statsInfoMapping: StatsKeyTranslations = {
	atk_power: ['Attack power', false],
	crit_chance: ['Crit chance', true],
	crit_dmg: ['Crit damage', true],
	great: ['Great success chance', true],
	atkPower: ['Attack power', false],
	hp: ['HP', false],
	critChance: ['Crit chance', true],
	armor: ['Armor', false],
	resistance: ['Resistance', false],
	critDmg: ['Crit damage', true],
	accuracy: ['Accuracy', true],
	evasion: ['Evasion', true],
	armorPenetration: ['Armor penetration', false],
	resistancePenetration: ['Resistance penetration', false],
	dmgReduction: ['Damage reduction', true],
	lifesteal: ['Lifesteal', true],
	// In-game name of `critdodgerate` (accessory option CRIT_DODGE, "Critical Resistance" sigils)
	critChanceReduction: ['Crit resistance', true],
	all: ['All stats', true],
};

export const translateStat = (stat: keyof StatsKeyTranslations): string | undefined => statsInfoMapping[stat]?.[0];

// Value alone, in the stat's unit (percent stats are stored as fractions)
export const formatStatValue = (stat: keyof StatsKeyTranslations, value: number): string => (
	statsInfoMapping[stat]?.[1]
		? `${(value * 100).toFixed(2)}%`
		: toClearNumber(value.toFixed(2))
);

export const formatStat = (stat: keyof StatsKeyTranslations, value: number): string | undefined => {
	const statInfo = statsInfoMapping[stat];

	if (!statInfo) return undefined;

	return `**${statInfo[0]}**: ${formatStatValue(stat, value)}`;
};
