import {
	Fish, FishHabitat, FishRank, FishType, FishReward
} from '@cquest/entities';

import { NormalizationResult } from './common-types';

import { readJSON } from '../util';

import {
	FishRaw, Habitat, Rank, Selltype, Type
} from './raw-types/fishes';
import { FisheriesRaw } from './raw-types/fisheries';
import { ItemsRaw, MaterialsRaw, RandomBoxesRaw } from './raw-types/items';

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

type RewardNameResolver = (selltype: Selltype, sellvalue: string) => string;

async function makeRewardNameResolver(input: FishesNormalizationInput): Promise<RewardNameResolver> {
	const [itemsRaw, materialsRaw, randomBoxesRaw] = await Promise.all([
		readJSON(input.itemsRawPath) as Promise<ItemsRaw>,
		readJSON(input.materialsRawPath) as Promise<MaterialsRaw>,
		readJSON(input.randomBoxesRawPath) as Promise<RandomBoxesRaw>,
	]);

	const currencies = new Map(itemsRaw.item.map(i => [i.type, i.name]));
	const materials = new Map(materialsRaw.material.map(m => [m.id, m.name]));
	const randomBoxes = new Map(randomBoxesRaw.randombox_info.map(b => [b.id, b.name]));

	return (selltype, sellvalue) => {
		switch (selltype) {
			case Selltype.ItemMaterial: return materials.get(sellvalue) ?? sellvalue;
			case Selltype.ItemRandombox: return randomBoxes.get(sellvalue) ?? sellvalue;
			default: return currencies.get(selltype) ?? sellvalue;
		}
	};
}

/** Fish that no fishing spot can spawn are leftovers of cut content (no texture, often no translation) */
async function catchableFishIds(fisheriesRawPath: string): Promise<Set<string>> {
	const fisheriesRaw = await readJSON(fisheriesRawPath) as FisheriesRaw;

	return new Set(fisheriesRaw.fishery.flatMap(f => [...f.fish, ...f.junk, ...f.hero, ...(f.boss ? [f.boss] : [])]));
}

export async function normalize(input: FishesNormalizationInput): Promise<NormalizationResult<Fish>> {
	const fishRaw = await readJSON(input.fishesRawPath) as FishRaw;
	const rewardName = await makeRewardNameResolver(input);
	const catchable = await catchableFishIds(input.fisheriesRawPath);

	const fishesTranslationIndices = {} as Record<string, number>;

	const fishes = fishRaw.fish.filter(f => catchable.has(f.id)).map((f, idx) => {
		fishesTranslationIndices[f.name] = idx;

		const rewards = [] as FishReward[];

		if (f.sellvalue) {
			rewards.push(new FishReward({
				type: f.sellvalue,
				amount: f.sellamount,
				name: rewardName(f.selltype, f.sellvalue),
			}));
		}

		if (f.selltype_2nd && f.sellvalue_2nd) {
			rewards.push(new FishReward({
				type: f.sellvalue_2nd,
				amount: f.sellamount_2nd,
				name: rewardName(f.selltype_2nd, f.sellvalue_2nd),
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
