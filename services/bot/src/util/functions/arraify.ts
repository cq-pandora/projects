export default function arraify<T>(entity: T | T[]): T[] {
	return Array.isArray(entity) ? entity : [entity];
}
