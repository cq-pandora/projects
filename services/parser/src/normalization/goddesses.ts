import { Goddess } from '@pandora/entities';

import { NormalizationResult } from './common-types';

import { readJSON } from '../util';

import { GoddessesRaw } from './raw-types/goddesses';

import { GoddessesNormalizationInput } from './input';

export async function normalize(input: GoddessesNormalizationInput): Promise<NormalizationResult<Goddess>> {
	const goddessesRaw = await readJSON(input.goddessesRawPath) as GoddessesRaw;

	const goddessTranslationIndex = {} as Record<string, number>;

	const goddesses = goddessesRaw.sister.map((raw, idx) => {
		goddessTranslationIndex[raw.name] = idx;

		return new Goddess({
			id: raw.id,
			name: raw.name,
			image: raw.dsp_tex,
			skillName: raw.skillname,
			skillDescription: raw.skilldesc,
			ingameId: raw.id,
		});
	});

	return {
		entities: goddesses,
		translationIndex: goddessTranslationIndex,
	};
}
