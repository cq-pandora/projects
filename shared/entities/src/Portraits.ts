import { TranslationKey } from './common-types';
import { registerDeserializer } from './Deserializer';
import { registerSerializer } from './Serializer';

export interface IPortraitOptions {
	keys: string[];
	id: string;
}

export class Portrait {
	public readonly id: string;
	public readonly keys: string[];

	constructor(options: IPortraitOptions) {
		this.keys = options.keys;
		this.id = options.id;
	}
}

export type Portraits = {
	[K in TranslationKey]: Portrait;
};

type PortraitsRaw = {
	[K in TranslationKey]: {
		keys: string[];
		id: string;
	};
};

function parsePortraits(rawJson: string): Portraits {
	const json = JSON.parse(rawJson) as PortraitsRaw;
	return Object.entries(json).reduce<Portraits>(
		(r, [translationKey, portraitRaw]) => {
			r[translationKey] = new Portrait({
				keys: portraitRaw.keys,
				id: portraitRaw.id,
			});

			return r;
		},
		{} as Portraits
	);
}

function serializePortraits(input: Portraits | Portraits[]): object {
	const target = Array.isArray(input) ? input[0] : input;

	return Object.entries(target).reduce(
		(res, current) => {
			const [key, portrait] = current;

			res[key] = portrait;

			return res;
		},
		{} as Record<string, Portrait>
	);
}

registerSerializer('Portraits', serializePortraits);
registerDeserializer<Portraits>('Portraits', parsePortraits);
