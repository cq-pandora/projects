import {
	Sigil, SigilStats, SigilRarity, SigilPair
} from '@pandora/entities';

import { NormalizationResult } from './common-types';
import { SigilsSetsRaw, SigilsRaw, SigilsStatsRaw } from './raw-types/sigils';

import { Raritytype } from './raw-types/sigils/sigils';

import { readJSON, arrayToId, sumStats } from '../util';

import { SigilsNormalizationInput } from './input';

function rarityMapper(rarity: Raritytype): SigilRarity {
	switch (rarity) {
		case Raritytype.Common: return 'common';
		case Raritytype.Epic: return 'epic';
		case Raritytype.Rare: return 'rare';
		case Raritytype.Set: return 'set';
		case Raritytype.Unique: return 'unique';
		default: throw new Error(`${rarity} is not a known sigil rarity`);
	}
}

export async function normalize(input: SigilsNormalizationInput): Promise<NormalizationResult<Sigil>> {
	const sigilsRaw = await readJSON(input.sigilsRawPath) as SigilsRaw;
	const sigilsSetsRaw = await readJSON(input.sigilsSetsRawPath) as SigilsSetsRaw;
	const sigilsOptionsRaw = await readJSON(input.sigilsStatsRawPath) as SigilsStatsRaw;

	const sigilsSets = arrayToId(sigilsSetsRaw.carve_stone_set);
	const sigilsStats = arrayToId(sigilsOptionsRaw.carve_stone_option);

	const sigilsTranslationsIndex = {} as Record<string, number>;

	const sigils = sigilsRaw.carve_stone.map((raw, idx) => {
		let set = undefined as SigilPair | undefined;

		if (raw.setid && sigilsSets[raw.setid]) {
			const setRaw = sigilsSets[raw.setid!];

			set = {
				name: setRaw.name,
				effect: setRaw.desc,
				pair: setRaw.paircarvestoneid,
			};
		}

		const stats = raw.optionidjson
			.map(id => {
				const stat = sigilsStats[id];

				return new SigilStats(
					stat.accuracyrate,
					stat.def,
					stat.penetratedef,
					stat.atkpower,
					stat.critrate,
					stat.critdodgerate,
					stat.critpowerrate,
					stat.receivedmgrate,
					stat.dodgerate,
					stat.maxhp,
					stat.vamprate,
					stat.rst,
					stat.penetraterst,
				);
			})
			.reduce((res, el) => {
				if (!res) return el;

				return sumStats(res, el);
			}, null as SigilStats | null) as SigilStats;

		sigilsTranslationsIndex[raw.name] = idx;

		return new Sigil(
			raw.id,
			raw.id,
			raw.name,
			raw.desc,
			raw.image,
			raw.grade,
			rarityMapper(raw.raritytype),
			raw.sell_reward_amount,
			raw.unequip_cost_amount,
			stats,
			set,
		);
	});

	return {
		entities: sigils,
		translationIndex: sigilsTranslationsIndex,
	};
}
