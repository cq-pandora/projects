export type Locale = string;

export type TranslationKey = string;

export type Stats =
	'atkPower' | 'hp' | 'critChance' | 'armor' | 'resistance' | 'critDmg' | 'accuracy' | 'evasion' |
	'armorPenetration' | 'resistancePenetration' | 'dmgReduction' | 'lifesteal' | 'critChanceReduction' | 'all';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericConstructor<T> = new (...args: any[]) => T;

export type ComputeRange<
	N extends number,
	Result extends Array<unknown> = []> =
	(Result['length'] extends N
		? Result
		: ComputeRange<N, [...Result, Result['length']]>
	);

export const ComputeRange = (N: number, Result: number[] = []): number[] => {
	if (Result.length === N) {
		return Result;
	}
	return ComputeRange(N, [...Result, Result.length]);
};
