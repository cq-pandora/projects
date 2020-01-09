import { TranslationKey } from './common-types';
import { registerDeserializer } from './Deserializer';
import { registerSerializer } from './Serializer';

export class Portrait {
	public readonly keys: string[];

	constructor(keys: string[]) {
		this.keys = keys;
	}
}

export type Portraits = {
	[K in TranslationKey]: Portrait;
};

type PortraitsRaw = {
	[K in TranslationKey]: Array<string>;
};

function parsePortraits(rawJson: string): Portraits {
	const json = JSON.parse(rawJson) as PortraitsRaw;
	return Object.entries(json).reduce<Portraits>(
		(r, [translationKey, portraitKeys]) => {
			r[translationKey] = new Portrait(portraitKeys);

			return r;
		},
		{} as Portraits
	);
}

function serializePortraits(input: Portraits | Portraits[]): object {
	const target = Array.isArray(input) ? input[0] : input;

	return Object.entries(target).reduce(
		(res, current) => {
			const [key, portraits] = current;

			res[key] = portraits.keys;

			return res;
		},
		{} as Record<string, string[]>
	);
}

registerSerializer('Portraits', serializePortraits);
registerDeserializer<Portraits>('Portraits', parsePortraits);
