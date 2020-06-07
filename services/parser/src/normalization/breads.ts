import {
	Bread, BreadRarity
} from '@cquest/entities';

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

		return new Bread({
			id: raw.id,
			name: raw.name,
			rarity: rarityMapper(raw.rarity),
			value: raw.trainpoint,
			greatChance: raw.critprob,
			grade: raw.grade,
			image: raw.image,
			sellCost: raw.sellprice
		});
	});

	return {
		entities: breads,
		translationIndex: breadsTranslationsIndex,
	};
}
