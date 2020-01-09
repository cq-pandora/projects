import { Faction } from '@pandora/entities';

import { NormalizationResult } from './common-types';

import { readJSON } from '../util';

import { FactionsRaw } from './raw-types/factions';

import { FactionsNormalizationInput } from './input';

export async function normalize(input: FactionsNormalizationInput): Promise<NormalizationResult<Faction>> {
	const factionsRaw = await readJSON(input.factionsRawPath) as FactionsRaw;

	const factionsTranslationIndex = {} as Record<string, number>;

	const breads = factionsRaw.champion_domain.map((raw, idx) => {
		factionsTranslationIndex[raw.name] = idx;

		return new Faction(
			raw.id,
			raw.name,
			raw.emblem_image,
			raw.id
		);
	});

	return {
		entities: breads,
		translationIndex: factionsTranslationIndex,
	};
}
