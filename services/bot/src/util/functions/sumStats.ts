import { IStatsHolder, Stats } from '@cquest/entities';

const STATS: Record<Stats, true> = {
	atkPower: true,
	hp: true,
	critChance: true,
	armor: true,
	resistance: true,
	critDmg: true,
	accuracy: true,
	evasion: true,
	armorPenetration: true,
	resistancePenetration: true,
	dmgReduction: true,
	lifesteal: true,
	critChanceReduction: true,
	all: true,
};

/**
 * Sums the stats present in either holder. Either side may be missing (e.g. support heroes have no berry caps).
 * Non-stat properties of entities such as `HeroForm` (name, star, ...) are ignored.
 */
export default function sumStats(stat1?: Partial<IStatsHolder>, stat2?: Partial<IStatsHolder>): IStatsHolder {
	const stats = {} as IStatsHolder;

	// Set keeps insertion order, so stats are listed in the order of the first holder
	for (const stat of new Set([...Object.keys(stat1 ?? {}), ...Object.keys(stat2 ?? {})])) {
		if (!(stat in STATS)) continue;

		const statName = stat as Stats;

		stats[statName] = (stat1?.[statName] ?? 0) + (stat2?.[statName] ?? 0);
	}

	return stats;
}
