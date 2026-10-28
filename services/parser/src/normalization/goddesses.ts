import { Goddess } from '@cquest/entities';

import { NormalizationResult } from './common-types';

import { readJSON } from '../util';

import { GoddessesRaw } from './raw-types/goddesses';

import { GoddessesNormalizationInput } from './input';

export async function normalize(input: GoddessesNormalizationInput): Promise<NormalizationResult<Goddess>> {
	const goddessesRaw = await readJSON(input.goddessesRawPath) as GoddessesRaw;

	const goddessTranslationIndex = {} as Record<string, number>;

	const goddesses = goddessesRaw.sister.map((raw, idx) => {
		// A goddess has several rows with the same name and skill (base, `_HEAD_*` story variants, `_S2` art).
		// Search returns one page per goddess: the `_S2` row (current art) when present, else the first row.
		if (!(raw.name in goddessTranslationIndex) || raw.id.endsWith('_S2')) {
			goddessTranslationIndex[raw.name] = idx;
		}

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
