import { Stats, HeroStats } from '@cquest/entities';

import toClearNumber from './toClearNumber';

export type StatsKey = Stats | HeroStats;

export type StatsKeyTranslations = {
	[key in StatsKey]: [string, boolean]
};

const statsInfoMapping: StatsKeyTranslations = {
	atk_power: ['Attack power', false],
	crit_chance: ['Crit chance', true],
	crit_dmg: ['Crit damage', true],
	great: ['Great', true],
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
	critChanceReduction: ['Crit chance reduction', true],
	all: ['All', true],
};

export const translateStat = (stat: keyof StatsKeyTranslations): string | undefined => statsInfoMapping[stat]?.[0];

export const formatStat = (stat: keyof StatsKeyTranslations, value: number): string | undefined => {
	const statInfo = statsInfoMapping[stat];

	if (!statInfo) return undefined;

	const [name, isPercentage] = statInfo;

	let val: string;

	if (isPercentage) {
		val = `${(value * 100).toFixed(2)}%`;
	} else {
		val = toClearNumber(value.toFixed(2));
	}

	return `**${name}**: ${val}`;
};
