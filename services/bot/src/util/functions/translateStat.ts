import { Stats, HeroStats } from '@pandora/entities';

export type StatsKey = Stats | HeroStats;

export type StatsKeyTranslations = {
	[key in StatsKey]: string
};

const statsNameMapping: StatsKeyTranslations = {
	// eslint-disable-next-line @typescript-eslint/camelcase
	atk_power: 'Attack power',
	// eslint-disable-next-line @typescript-eslint/camelcase
	crit_chance: 'Crit chance',
	// eslint-disable-next-line @typescript-eslint/camelcase
	crit_dmg: 'Crit damage',
	great: 'Great',
	atkPower: 'Attack power',
	hp: 'HP',
	critChance: 'Crit chance',
	armor: 'Armor',
	resistance: 'Resistance',
	critDmg: 'Crit damage',
	accuracy: 'Accuracy',
	evasion: 'Evasion',
	armorPenetration: 'Armor penetration',
	resistancePenetration: 'Resistance penetration',
	dmgReduction: 'Damage reduction',
	lifesteal: 'Lifesteal',
	critChanceReduction: 'Crit chance reduction',
	all: 'All'
};

export default (stat: keyof StatsKeyTranslations): string => statsNameMapping[stat] as string;
