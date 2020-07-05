import { StatsKey, formatStat } from './stat-utils';

export default (obj: Partial<Record<StatsKey, number>>, force = false): string => (
	Object.entries(obj)
		.filter(([, value]) => (
			value !== undefined && (value > 0 || force)
		))
		.map((kv) => {
			const [key, value] = kv as [StatsKey, number];

			return formatStat(key, value);
		})
		.filter(v => Boolean(v))
		.join('\n')
);
