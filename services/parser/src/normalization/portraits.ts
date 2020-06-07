import {
	Portrait, Portraits
} from '@cquest/entities';

import { NormalizationResult } from './common-types';

import { readJSON } from '../util';

import { PortraitsRaw } from './raw-types/portraits';

import { PortraitsNormalizationInput } from './input';

export async function normalize(input: PortraitsNormalizationInput): Promise<NormalizationResult<Portraits>> {
	const portraitsRaw = await readJSON(input.portraitsRawPath) as PortraitsRaw;
	const portraitsTranslationIndex = {} as Record<string, string>;

	const portraits = portraitsRaw.illust_collection.reduce((r, v) => {
		r[v.name] = new Portrait({ keys: [v.portrait_1], id: v.id });

		portraitsTranslationIndex[v.name] = v.name;

		if (v.portrait_2) r[v.name].keys.push(v.portrait_2);
		if (v.portrait_3) r[v.name].keys.push(v.portrait_3);

		return r;
	}, {} as Portraits);

	return {
		entities: [portraits],
		translationIndex: portraitsTranslationIndex,
	};
}
