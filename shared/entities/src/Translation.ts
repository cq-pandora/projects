import { autoserialize, Deserialize, Serialize } from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { TranslationKey } from './common-types';
import { registerSerializer } from './Serializer';

export interface ITranslationOptions {
	text: string;
	version: string;
	original: boolean;
	key: string;
}

export class Translation {
	@autoserialize public readonly text: string;
	public key = '';
	@autoserialize public readonly version: string;
	@autoserialize public readonly original: boolean;

	constructor(options: ITranslationOptions) {
		this.text = options.text;
		this.version = options.version;
		this.original = options.original;
		this.key = options.key;
	}
}

export type Translations = {
	[k in TranslationKey]: Translation;
};

type TranslationsRaw = {
	[k in TranslationKey]: object;
};

function parseTranslations(rawJson: string): Translations {
	const json = JSON.parse(rawJson) as TranslationsRaw;

	return Object.entries(json).reduce<Translations>((r, [idRaw, raw]) => {
		const id = idRaw as TranslationKey;

		r[id] = Deserialize(raw, Translation) as Translation;
		r[id].key = id;

		return r;
	}, {} as Translations);
}

function serializeTranslation(input: Translations | Translations[]): object {
	const translations = Array.isArray(input) ? input[0] : input;

	return Object.entries(translations).reduce(
		(res, current) => {
			const [key, translation] = current;

			res[key] = Serialize(translation, Translation);

			return res;
		},
		{} as Record<string, object>
	);
}

registerDeserializer<Translations>('Translations', parseTranslations);
registerSerializer('Translations', serializeTranslation);
