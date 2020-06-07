import { Faction } from '@cquest/entities';

import { NormalizationResult } from './common-types';

import { readJSON } from '../util';

import { FactionsRaw } from './raw-types/factions';

import { FactionsNormalizationInput } from './input';

export async function normalize(input: FactionsNormalizationInput): Promise<NormalizationResult<Faction>> {
	const factionsRaw = await readJSON(input.factionsRawPath) as FactionsRaw;

	const factionsTranslationIndex = {} as Record<string, number>;

	const breads = factionsRaw.champion_domain.map((raw, idx) => {
		factionsTranslationIndex[raw.name] = idx;

		return new Faction({
			id: raw.id,
			name: raw.name,
			image: raw.emblem_image,
			ingameId: raw.id,
		});
	});

	return {
		entities: breads,
		translationIndex: factionsTranslationIndex,
	};
}
