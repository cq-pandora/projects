import { Translations, Translation } from '@pandora/entities';

import { readJSON, gameVersion } from '../util';

import { TranslationsNormalizationInput } from './input';

type TranslationsKey = 'text1' | 'text2' | 'text_dialogue1' | 'text_dialogue2';
const TranslationsValues = ['text1', 'text2', 'text_dialogue1', 'text_dialogue2'] as TranslationsKey[];

type TranslationRaw = Record<string, string>;
type TranslationDataStructure = {
	[key in TranslationsKey]?: TranslationRaw[];
};

export async function normalize(input: TranslationsNormalizationInput): Promise<Translations> {
	const version = await gameVersion();

	const textPaths = input.textsRawPaths;
	const contents: TranslationRaw[][] = [];

	for (const filename of textPaths) {
		const data = await readJSON(filename) as TranslationDataStructure;

		for (const k of TranslationsValues) {
			const d = data[k];

			if (typeof d !== 'undefined') {
				contents.push(d);
				break;
			}
		}
	}

	return contents
		.reduce((r, v) => r.concat(v), [] as TranslationRaw[])
		.reduce((r: Translations, v) => {
			const translationKey = Object.keys(v)[0];

			if (!r[translationKey] || r[translationKey].text !== v[translationKey]) {
				r[translationKey] = new Translation({
					text: v[translationKey],
					version,
					original: true,
					key: translationKey,
				});
			}

			return r;
		}, {} as Translations);
}
