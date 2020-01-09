import {
	Boss
} from '@pandora/entities';

import { NormalizationResult } from './common-types';

import { arrayToId, readJSON } from '../util';

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

			return new Boss(
				c.id,
				name,
				c.face_tex,
				stats.hitrate,
				(1 + (stats.grade - 1) / 10) * (stats.defense + stats.growthdefense * (stats.grade * 10 - 1)),
				stats.penetratedef,
				(1 + (stats.grade - 1) / 10) * (stats.initialattdmg + stats.growthattdmg * (stats.grade * 10 - 1)),
				stats.critprob,
				0,
				stats.critpower,
				stats.dmgreduce,
				stats.dodgerate,
				(1 + (stats.grade - 1) / 10) * (stats.initialhp + stats.growthhp * (stats.grade * 10 - 1)),
				stats.vamp,
				(1 + (stats.grade - 1) / 10) * (stats.resist + stats.growthresist * (stats.grade * 10 - 1)),
				stats.penetraterst,
			);
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
