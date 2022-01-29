const initializedKey = Symbol.for('initialized');
const initializerKey = Symbol.for('initializer');
const origKey = Symbol.for('orig');

export type InitializerFunction<T extends object> = {
	(this: T, instance: T): Promise<unknown> | unknown;
};

export type LateInit<T extends object> = {
	[initializedKey]: boolean;
	[origKey]: T;
	[initializerKey]: InitializerFunction<T>;
} & T;

export function lateinit<T extends object>(obj: T, initializer: InitializerFunction<T>): LateInit<T> {
	let late!: LateInit<T>;

	if (Array.isArray(obj)) {
		late = Object.assign([], {
			[initializerKey]: initializer,
			[origKey]: obj,
			[initializedKey]: false,
		}) as LateInit<T>;
	} else {
		late = {
			[initializerKey]: initializer,
			[origKey]: obj,
			[initializedKey]: false,
		} as LateInit<T>;

		Object.setPrototypeOf(late, Object.getPrototypeOf(obj));
	}

	return new Proxy(late, {
		get(target, p): any {
			const name = p as keyof typeof late;

			if (target[initializedKey]) {
				// @ts-expect-error Pass to original object, if not found in current
				return target[name] ?? target[origKey][name];
			}

			if (initializerKey === name) {
				return target[initializerKey];
			}

			if (origKey === name) {
				return target[origKey];
			}

			if (initializedKey === name) {
				return target[initializedKey];
			}

			throw new Error(`Late init not initialized, but key "${name}" of type ${typeof name} requested`);
		}
	});
}

export async function reinit<T extends object>(i: LateInit<T>): Promise<LateInit<T>> {
	throw new Error(`Not implemented for ${i}`);
}

export async function init<T extends object>(i: LateInit<T>): Promise<LateInit<T>> {
	if (i[initializedKey]) return i;

	await i[initializerKey](i);

	i[initializedKey] = true;

	return i;
}
