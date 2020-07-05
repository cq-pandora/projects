import { Scarecrow } from '@cquest/entities';

import { NormalizationResult } from './common-types';
import { ScarecrowsNormalizationInput } from './input';

import { readJSON, arrayToId, growStats } from '../util';

import { ScarecrowsRaw } from './raw-types/scarecrows';
import { CharacterStatsRaw, CharacterVisualRaw } from './raw-types/heroes';

export async function normalize(input: ScarecrowsNormalizationInput): Promise<NormalizationResult<Scarecrow>> {
	const scarecrowsRaw = await readJSON(input.dummyRawPath) as ScarecrowsRaw;
	const characterStatRaw = await readJSON(input.charactersStatsRawPath) as CharacterStatsRaw;
	const characterVisualRaw = await readJSON(input.charactersGeneralInfoRawPath) as CharacterVisualRaw;

	const characterStatById = arrayToId(characterStatRaw.character_stat);
	const characterVisualById = arrayToId(characterVisualRaw.character_visual);

	const scarecrows = scarecrowsRaw.dummy.sort((a, b) => a.priority - b.priority).map(raw => {
		const vis = characterVisualById[raw.visualid];
		const stats = characterStatById[vis.default_stat_id];

		return new Scarecrow({
			id: raw.id,
			name: raw.nametext,
			description: raw.desctext,
			image: vis.face_tex,
			priority: raw.priority,
			accuracy: 0,
			armor: growStats(stats.defense, stats.growthdefense, vis.grade),
			armorPenetration: 0,
			atkPower: growStats(stats.initialattdmg, stats.growthattdmg, vis.grade),
			critChance: stats.critprob,
			critChanceReduction: 0,
			critDmg: stats.critpower,
			dmgReduction: 0,
			evasion: 0,
			hp: growStats(stats.initialhp, stats.growthhp, vis.grade),
			lifesteal: 0,
			resistance: growStats(stats.resist, stats.growthresist, vis.grade),
			resistancePenetration: 0,
		});
	});

	return {
		entities: scarecrows,
		translationIndex: scarecrows.reduce(
			(r, v, idx) => {
				r[v.name] = idx;

				return r;
			},
			{} as Record<string, number>
		)
	};
}
