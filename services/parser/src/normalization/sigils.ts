import {
	Sigil, SigilStats, SigilRarity, SigilPair, IStatsHolder
} from '@cquest/entities';

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

				return {
					all: 0,
					accuracy: stat.accuracyrate,
					armor: stat.def,
					armorPenetration: stat.penetratedef,
					atkPower: stat.atkpower,
					critChance: stat.critrate,
					critChanceReduction: stat.critdodgerate,
					critDmg: stat.critpowerrate,
					dmgReduction: stat.receivedmgrate,
					evasion: stat.dodgerate,
					hp: stat.maxhp,
					lifesteal: stat.vamprate,
					resistance: stat.rst,
					resistancePenetration: stat.penetraterst,
				} as IStatsHolder;
			})
			.reduce((res, el) => sumStats(res, el));

		sigilsTranslationsIndex[raw.name] = idx;

		return new Sigil({
			id: raw.id,
			ingameId: raw.id,
			name: raw.name,
			description: raw.desc,
			image: raw.image,
			grade: raw.grade,
			rarity: rarityMapper(raw.raritytype),
			sellCost: raw.sell_reward_amount,
			extractCost: raw.unequip_cost_amount,
			stats: new SigilStats(stats),
			set
		});
	});

	return {
		entities: sigils,
		translationIndex: sigilsTranslationsIndex,
	};
}
