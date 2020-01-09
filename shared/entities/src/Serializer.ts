import { GenericConstructor } from './common-types';

type Entities = any;

export type Serializer<T> = (input: T | T[]) => object | object[];

const registered: {
	[className: string]: Serializer<Entities>;
} = {};

export function registerSerializer<T extends Entities>(
	ctor: GenericConstructor<T> | string,
	d: Serializer<T>
): void {
	registered[typeof ctor === 'string' ? ctor : ctor.name] = d;
}

export function Serialize<T extends Entities>(
	input: T | T[], ctor: GenericConstructor<T> | string, beautify = true
): string {
	const serializer = registered[typeof ctor === 'string' ? ctor : ctor.name] as Serializer<T>;
	const data = serializer(input);

	if (beautify) return JSON.stringify(data, null, 4);

	return JSON.stringify(data);
}
