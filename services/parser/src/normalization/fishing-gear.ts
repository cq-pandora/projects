import {
	FishingGear, FishingGearType, FishHabitat, FishingGearSource
} from '@cquest/entities';

import { NormalizationResult } from './common-types';

import { readJSON } from '../util';

import {
	FishingGearRaw, Habitat, Howtoget, Type
} from './raw-types/fishing-gear';
import { FisheriesRaw } from './raw-types/fisheries';

import { FishingGearNormalizationInput } from './input';

function habitatMapper(habitat: Habitat): FishHabitat {
	switch (habitat) {
		case Habitat.Event: return 'event';
		case Habitat.Freshwater: return 'freshwater';
		case Habitat.Sea: return 'sea';
		default: throw new Error(`Unknown fish habitat: ${habitat}`);
	}
}

function typeMapper(type: Type): FishingGearType {
	switch (type) {
		case Type.ItemBait: return 'item_bait';
		case Type.ItemFloat: return 'item_float';
		case Type.ItemRod: return 'item_rod';
		default: throw new Error(`Unknown fishing gear type: ${type}`);
	}
}

function howToGetMapper(howToGet: Howtoget): FishingGearSource {
	switch (howToGet) {
		case Howtoget.Collection: return 'collection';
		case Howtoget.Event: return 'event';
		case Howtoget.None: return 'none';
		case Howtoget.Shop: return 'shop';
		default: throw new Error(`Unknown fishing gear source: ${howToGet}`);
	}
}

export async function normalize(input: FishingGearNormalizationInput): Promise<NormalizationResult<FishingGear>> {
	const fishingGearRaw = await readJSON(input.fishingGearRawPath) as FishingGearRaw;
	const fisheriesRaw = await readJSON(input.fisheriesRawPath) as FisheriesRaw;

	const collectionRewards = new Map(
		fisheriesRaw.fishery.filter(f => f.bonusvalue).map(f => [f.bonusvalue as string, f.name])
	);

	const fishingGearTranslationIndices = {} as Record<string, number>;

	const fishingGear = fishingGearRaw.fishing_gear.map((g, idx) => {
		fishingGearTranslationIndices[g.name] = idx;

		return new FishingGear({
			id: g.id,
			name: g.name,
			type: typeMapper(g.type),
			grade: g.level,
			habitat: habitatMapper(g.habitat),
			habitatBonus: g.habitatvalue,
			power: g.atk,
			bigChance: g.addrarity,
			biteChance: g.addbite,
			eventChance: g.addrarityevent,
			currency: g.cost_value,
			price: g.cost_amount,
			image: g.geartexture,
			description: g.desc,
			howToGet: howToGetMapper(g.howtoget),
			collectionReward: collectionRewards.get(g.id) ?? null,
		});
	});

	return {
		entities: fishingGear,
		translationIndex: fishingGearTranslationIndices,
	};
}
