type Grouped<T> = Record<keyof T, T[]>;

export default function groupBy<T>(arr: T[], field: keyof T): Grouped<T> {
	return arr.reduce(
		(r, v) => {
			const k = v[field];

			// @ts-expect-error Shorthand
			(r[k] = r[k] || []).push(v);

			return r;
		},
		{} as Grouped<T>
	);
}
