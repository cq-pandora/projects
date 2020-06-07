import {
	Boss
} from '@cquest/entities';

import { NormalizationResult } from './common-types';

import { arrayToId, readJSON, growStats } from '../util';

import { CharacterVisualRaw, Type } from './raw-types/heroes/character-visual';
import { CharacterStatsRaw } from './raw-types/heroes';

import { BossesNormalizationInput } from './input';

export async function normalize(input: BossesNormalizationInput): Promise<NormalizationResult<Boss>> {
	const bossesRaw = await readJSON(input.charactersGeneralInfoRawPath) as CharacterVisualRaw;
	const characterStatRaw = await readJSON(input.charactersStatsRawPath) as CharacterStatsRaw;

	const characterStatById = arrayToId(characterStatRaw.character_stat);

	const bossesTranslationIndices = {} as Record<string, number[]>;

	const bosses = bossesRaw.character_visual
		.filter(c => c.type === Type.Boss || c.type === Type.Hiddenboss)
		.map((c, idx) => {
			const stats = characterStatById[c.default_stat_id];

			const name = c.name!;

			if (!bossesTranslationIndices[name]) {
				bossesTranslationIndices[name] = [idx];
			} else {
				bossesTranslationIndices[name].push(idx);
			}

			return new Boss({
				id: c.id,
				name,
				image: c.face_tex,
				accuracy: stats.hitrate,
				armor: growStats(stats.defense, stats.growthdefense, c.grade),
				armorPenetration: stats.penetratedef,
				atkPower: growStats(stats.initialattdmg, stats.growthattdmg, c.grade),
				critChance: stats.critprob,
				critChanceReduction: 0,
				critDmg: stats.critpower,
				dmgReduction: stats.dmgreduce,
				evasion: stats.dodgerate,
				hp: growStats(stats.initialhp, stats.growthhp, c.grade),
				lifesteal: stats.vamp,
				resistance: growStats(stats.resist, stats.growthresist, c.grade),
				resistancePenetration: stats.penetraterst
			});
		});

	const translationIndex = Object.entries(bossesTranslationIndices).reduce((r, v) => {
		r[v[0]] = v[1].join(',');
		return r;
	}, {} as Record<string, string>);

	return {
		entities: bosses,
		translationIndex,
	};
}
