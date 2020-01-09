import {
	Bread, BreadRarity
} from '@pandora/entities';

import { NormalizationResult } from './common-types';

import { readJSON } from '../util';

import { BreadsRaw, Rarity } from './raw-types/breads';

import { BreadsNormalizationInput } from './input';

function rarityMapper(rarity: Rarity): BreadRarity {
	switch (rarity) {
		case Rarity.Common: return 'common';
		case Rarity.Epic: return 'epic';
		case Rarity.Legendary: return 'legendary';
		case Rarity.Rare: return 'rare';
		default: throw new Error(`${rarity} is not known bread rarity`);
	}
}

export async function normalize(input: BreadsNormalizationInput): Promise<NormalizationResult<Bread>> {
	const breadsRaw = await readJSON(input.breadsRawPath) as BreadsRaw;

	const breadsTranslationsIndex = {} as Record<string, number>;

	const breads = breadsRaw.bread.map((raw, idx) => {
		breadsTranslationsIndex[raw.name] = idx;

		return new Bread(
			raw.id,
			raw.name,
			rarityMapper(raw.rarity),
			raw.trainpoint,
			raw.critprob,
			raw.grade,
			raw.image,
			raw.sellprice,
		);
	});

	return {
		entities: breads,
		translationIndex: breadsTranslationsIndex,
	};
}
