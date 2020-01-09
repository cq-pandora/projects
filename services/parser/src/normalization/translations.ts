import { Translations, Translation } from '@pandora/entities';

import { readJSON, gameVersion } from '../util';

import { TranslationsNormalizationInput } from './input';

type TranslationRaw = Record<string, string>;
type TranslationDataStructure = {
	status: 'success';
	text1?: TranslationRaw[];
} & {
	status: 'success';
	text2?: TranslationRaw[];
};

export async function normalize(input: TranslationsNormalizationInput): Promise<Translations> {
	const version = await gameVersion();

	const textPaths = input.textsRawPaths;
	const contents: TranslationRaw[][] = [];

	for (const filename of textPaths) {
		const data = await readJSON(filename) as TranslationDataStructure;

		if (data.text1) {
			contents.push(data.text1);
		} else {
			contents.push(data.text2!);
		}
	}

	return contents
		.reduce((r, v) => r.concat(v), [] as TranslationRaw[])
		.reduce((r: Translations, v) => {
			const translationKey = Object.keys(v)[0];

			if (!r[translationKey] || r[translationKey].text !== v[translationKey]) {
				r[translationKey] = new Translation(
					v[translationKey],
					version,
					true,
					translationKey
				);
			}

			return r;
		}, {} as Translations);
}
