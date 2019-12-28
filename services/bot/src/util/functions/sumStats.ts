import { IStatsHolder, Stats } from '@pandora/entities';

export default function sumStats(stat1: IStatsHolder, stat2: IStatsHolder): IStatsHolder {
	const stats = {} as IStatsHolder;

	for (const stat of Object.keys(stat1 || {})) {
		const statName = stat as Stats;

		stats[statName] = (stat1[statName] || 0) + (stat2[statName] || 0);
	}

	return stats;
}
