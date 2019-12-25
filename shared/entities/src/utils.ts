// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function arraify<T extends any|any[]>(entity: T): any[] {
	return Array.isArray(entity) ? entity : [entity];
}
