import { TranslationKey } from './common-types';
import { registerDeserializer } from './Deserializer';

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

export function parsePortraits(rawJson: string): Portraits {
	const json = JSON.parse(rawJson) as PortraitsRaw;
	return Object.entries(json).reduce<Portraits>(
		(r, [translationKey, portraitKeys]) => {
			r[translationKey] = new Portrait(portraitKeys);

			return r;
		},
		{} as Portraits
	);
}

registerDeserializer<Portraits>('Portraits', parsePortraits);
