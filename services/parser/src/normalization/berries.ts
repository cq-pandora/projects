import {
	Berry, BerryRarity, HeroStats, BerryCategory
} from '@pandora/entities';

import { NormalizationResult } from './common-types';

import { readJSON } from '../util';

import { BerriesRaw, Rarity, Category } from './raw-types/berries';

import { BerriesNormalizationInput } from './input';

function rarityMapper(rarity: Rarity): BerryRarity {
	switch (rarity) {
		case Rarity.Common: return 'common';
		case Rarity.Epic: return 'epic';
		case Rarity.Legendary: return 'legendary';
		case Rarity.Rare: return 'rare';
		default: throw new Error(`${rarity} is not known berry rarity`);
	}
}

function statMapper(rawType: string): HeroStats {
	const type = rawType.replace('Ratio', '');

	switch (type) {
		case 'Accuracy': return 'accuracy';
		case 'Armor': return 'armor';
		case 'AttackPower': return 'atk_power';
		case 'CriticalDamage': return 'crit_dmg';
		case 'CriticalChance': return 'crit_chance';
		case 'Dodge': return 'evasion';
		case 'Great': return 'great';
		case 'HP': return 'hp';
		case 'Resistance': return 'resistance';
		case 'All': return 'all';
		default: throw new Error(`Unknown berry stat: ${rawType}`);
	}
}

function categoryMapper(rawCategory: Category): BerryCategory {
	switch (rawCategory) {
		case Category.All: return 'all';
		case Category.Atk: return 'atk';
		case Category.Def: return 'def';
		case Category.Util: return 'util';
		default: throw new Error(`Unknown berry category: ${rawCategory}`);
	}
}

export async function normalize(input: BerriesNormalizationInput): Promise<NormalizationResult<Berry>> {
	const berriesRaw = await readJSON(input.berriesRawPath) as BerriesRaw;

	const berriesTranslationsIndex = {} as Record<string, number>;

	const berries = berriesRaw.add_stat_item.map((raw, idx) => {
		berriesTranslationsIndex[raw.name] = idx;

		return new Berry(
			{
				id: raw.id,
				name: raw.name,
				rarity: rarityMapper(raw.rarity),
				targetStat: statMapper(raw.type),
				isPercentage: raw.type.includes('Ratio') || raw.type === 'Great' || raw.type === 'All',
				value: raw.addstatpoint,
				greatChance: raw.greatprob,
				grade: raw.grade,
				image: raw.image,
				category: categoryMapper(raw.category),
				sellCost: raw.sellprice,
				eatCost: raw.eatprice
			}
		);
	});

	return {
		entities: berries,
		translationIndex: berriesTranslationsIndex,
	};
}
