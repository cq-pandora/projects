import { ChampionBond, ChampionBondLevel, ChampionBondSkill } from '@cquest/entities';

import { NormalizationResult } from './common-types';
import { ChampionBondNormalizationInput } from './input';

import { readJSON, arrayToId } from '../util';

import { ChampionBondRaw } from './raw-types/champion-bond';
import { ChampionSkillsRaw } from './raw-types/champions';

export async function normalize(input: ChampionBondNormalizationInput): Promise<NormalizationResult<ChampionBond>> {
	const bondRaw = await readJSON(input.championBondRawPath) as ChampionBondRaw;
	const championSkillRaw = await readJSON(input.championsSkillRawPath) as ChampionSkillsRaw;

	const skillsById = arrayToId(championSkillRaw.champion_skill);
	const levelsRaw = bondRaw.champion_link_level_stat_unlock.sort((a, b) => a.id - b.id);

	const levels = levelsRaw.map(raw => new ChampionBondLevel({
		level: raw.id,
		exp: raw.levelupexp,
		hp: raw.maxhp,
		atkPower: raw.atkpower,
		critChance: raw.critrate,
		critDmg: raw.critpowerrate,
	}));

	const skills = levelsRaw.filter(raw => raw.unlockskill).map(raw => {
		const skill = skillsById[raw.unlockskill!];

		if (!skill) throw new Error(`Unknown champion bond skill ${raw.unlockskill}`);

		return new ChampionBondSkill({
			id: skill.id,
			name: skill.name,
			description: skill.desc,
			image: skill.skillicon,
			// The unlock condition sits on the level it gates: 0 -> 1 forms the bond, 49 -> 50, 99 -> 100
			level: raw.id + 1,
			requiredHeroes: raw.unlocktargetamount,
			requiredHeroType: raw.unlocktargetrarity!.toLowerCase(),
			requiredInheritance: raw.unlocktargetepiclevel,
		});
	});

	return {
		entities: [new ChampionBond({ levels, skills })],
	};
}
