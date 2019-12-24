import { autoserialize, Deserialize } from 'cerialize';

import { TranslationKey } from './commonTypes';

export class Translation {
	@autoserialize public readonly text: string;
	@autoserialize public readonly version: string;
	@autoserialize public readonly original: boolean;

	constructor(text: string, version: string, original: boolean) {
		this.text = text;
		this.version = version;
		this.original = original;
	}
}

export type Translations = {
	[k in TranslationKey]: Translation;
};

type TranslationsRaw = {
	[k in TranslationKey]: object;
};

export function parseTranslations(rawJson: string): Translations {
	const json = JSON.parse(rawJson) as TranslationsRaw;

	return Object.entries(json).reduce<Translations>((r, [idRaw, raw]) => {
		r[idRaw as TranslationKey] = Deserialize(raw, Translation) as Translation;

		return r;
	}, {} as Translations);
}
