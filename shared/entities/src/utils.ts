export function arraify<T extends any|any[]>(entity: T): any[] {
	return Array.isArray(entity) ? entity : [entity];
}
