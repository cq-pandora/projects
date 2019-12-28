import translateStat, { StatsKey } from './translateStat';
import toClearNumber from './toClearNumber';

export default (obj: Partial<Record<StatsKey, number>>, force = false): string => (
	Object.entries(obj)
		.filter(([, value]) => (
			value !== undefined && (value > 0 || force)
		))
		.map((kv) => {
			const [key, value] = kv as [StatsKey, number];
			const name = translateStat(key);
			const statValue = value < 10
				? `${Number((value * 100).toFixed(2))}%`
				: toClearNumber(value.toFixed(2));

			return `**${name}**: ${statValue}`;
		})
		.join('\n')
);
