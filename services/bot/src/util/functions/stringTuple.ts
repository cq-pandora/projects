export default function stringTuple<T extends [string] | string[]>(...data: T): T {
	return data;
}
