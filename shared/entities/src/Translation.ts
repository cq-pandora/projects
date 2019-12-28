import { autoserialize, Deserialize } from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { TranslationKey } from './common-types';

export class Translation {
	@autoserialize public readonly text: string;
	public key = '';
	@autoserialize public readonly version: string;
	@autoserialize public readonly original: boolean;

	constructor(text: string, version: string, original: boolean, key: string) {
		this.text = text;
		this.version = version;
		this.original = original;
		this.key = key;
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

registerDeserializer<Translations>('Translations', parseTranslations);
