export type TranslationKey = string;

export type Stats =
	'atkPower' | 'hp' | 'critChance' | 'armor' | 'resistance' | 'critDmg' | 'accuracy' | 'evasion' |
	'armorPenetration' | 'resistancePenetration' | 'dmgReduction' | 'lifesteal' | 'critChanceReduction' | 'all';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericConstructor<T> = new (...args: any[]) => T;
