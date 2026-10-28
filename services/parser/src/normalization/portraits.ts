import {
	Portrait, Portraits
} from '@cquest/entities';

import { NormalizationResult } from './common-types';

import { readJSON, arrayToId } from '../util';

import { PortraitsRaw, PortraitDataRaw } from './raw-types/portraits';

import { PortraitsNormalizationInput } from './input';

export async function normalize(input: PortraitsNormalizationInput): Promise<NormalizationResult<Portraits>> {
	const portraitsRaw = await readJSON(input.portraitsRawPath) as PortraitsRaw;
	const portraitDataRaw = await readJSON(input.portraitsDataRawPath) as PortraitDataRaw;
	const portraitDataById = arrayToId(portraitDataRaw.portrait);
	const portraitsTranslationIndex = {} as Record<string, string>;

	// Illustration keys name a portrait definition, not always a sprite: e.g. `portrait_atalante_default` is drawn
	// from the `portrait_atlanta_default` sprite. Resolve single-sprite definitions to that sprite; layered ones
	// (several sprites composed at runtime) cannot be shown as one image, so their key is kept.
	const spriteOf = (key: string): string => {
		const sprites = Object.keys(portraitDataById[key]?.value ?? {});

		return sprites.length === 1 ? sprites[0] : key;
	};

	const portraits = portraitsRaw.illust_collection.reduce((r, v) => {
		if (!v.name) {
			return r;
		}

		r[v.name] = new Portrait({ keys: [spriteOf(v.portrait_1)], id: v.id });

		portraitsTranslationIndex[v.name] = v.name;

		if (v.portrait_2) r[v.name].keys.push(spriteOf(v.portrait_2));
		if (v.portrait_3) r[v.name].keys.push(spriteOf(v.portrait_3));

		return r;
	}, {} as Portraits);

	return {
		entities: [portraits],
		translationIndex: portraitsTranslationIndex,
	};
}
