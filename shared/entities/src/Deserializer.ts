import { arraify } from './utils';
import { GenericConstructor } from './common-types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Entities = any;

export type Deserializer<Entities> = (input: string) => [Entities] | Entities;

const registered: {
	[className: string]: Deserializer<Entities>;
} = {};

export function registerDeserializer<T extends Entities>(
	ctor: GenericConstructor<T> | string,
	d: Deserializer<T>
): void {
	registered[typeof ctor === 'string' ? ctor : ctor.name] = d;
}

export function DeserializeSingle<T extends Entities>(input: string, ctor: GenericConstructor<T> | string): T {
	const deserializer = registered[typeof ctor === 'string' ? ctor : ctor.name] as Deserializer<T>;
	const result = deserializer(input);

	return Array.isArray(result) ? result[0] : result;
}

export function Deserialize<T extends Entities>(input: string, ctor: GenericConstructor<T> | string): Array<T> {
	const deserializer = registered[typeof ctor === 'string' ? ctor : ctor.name] as Deserializer<T>;
	const result = deserializer(input);

	return arraify(result);
}
