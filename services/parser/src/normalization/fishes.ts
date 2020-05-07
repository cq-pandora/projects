import {
	Fish, FishHabitat, FishRank, FishType, FishReward
} from '@pandora/entities';

import { NormalizationResult } from './common-types';

import { readJSON } from '../util';

import {
	FishRaw, Habitat, Rank, Type
} from './raw-types/fishes';

import { FishesNormalizationInput } from './input';

function rankMapper(rank: Rank): FishRank {
	switch (rank) {
		case Rank.Boss: return 'boss';
		case Rank.Event: return 'event';
		case Rank.Eventbox: return 'eventbox';
		case Rank.Normal: return 'normal';
		case Rank.Hero: return 'hero';
		default: throw new Error(`Unknown fish rank: ${rank}`);
	}
}

function habitatMapper(habitat: Habitat): FishHabitat {
	switch (habitat) {
		case Habitat.Event: return 'event';
		case Habitat.Freshwater: return 'freshwater';
		case Habitat.Sea: return 'sea';
		default: throw new Error(`Unknown fish habitat: ${habitat}`);
	}
}

function typeMapper(type: Type): FishType {
	switch (type) {
		case Type.Event: return 'event';
		case Type.Fish: return 'fish';
		case Type.Junk: return 'junk';
		default: throw new Error(`Unknown fish type: ${type}`);
	}
}

export async function normalize(input: FishesNormalizationInput): Promise<NormalizationResult<Fish>> {
	const fishRaw = await readJSON(input.fishesRawPath) as FishRaw;

	const fishesTranslationIndices = {} as Record<string, number>;

	const fishes = fishRaw.fish.map((f, idx) => {
		fishesTranslationIndices[f.name] = idx;

		const rewards = [] as FishReward[];

		if (f.sellvalue) {
			rewards.push(new FishReward({
				type: f.sellvalue,
				amount: f.sellamount,
			}));
		}

		if (f.sellvalue_2nd) {
			rewards.push(new FishReward({
				type: f.sellvalue_2nd,
				amount: f.sellamount_2nd!,
			}));
		}

		return new Fish({
			id: f.id,
			name: f.name,
			habitat: habitatMapper(f.habitat),
			rank: rankMapper(f.rank),
			type: typeMapper(f.type),
			grade: f.rarity,
			startsFrom: f.minlength,
			image: f.texture,
			exp: f.exp,
			rewards,
			description: f.desc
		});
	});

	return {
		entities: fishes,
		translationIndex: fishesTranslationIndices,
	};
}
