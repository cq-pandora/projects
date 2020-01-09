import {
	Champion, ChampionForm, ChampionSkill, ChampionType
} from '@pandora/entities';

import { NormalizationResult } from './common-types';

import { readJSON, groupBy, arrayToId } from '../util';

import { ChampionsRaw, ChampionSlotRaw, ChampionSkillsRaw } from './raw-types/champions';
import { ChampionSkill as ChampionSkillRaw } from './raw-types/champions/skill';
import { Type } from './raw-types/champions/champion';

import { ChampionsNormalizationInput } from './input';

function typeMapper(type: Type): ChampionType {
	switch (type) {
		case Type.Attack: return 'atk';
		case Type.Defence: return 'def';
		case Type.Utils: return 'util';
		default: throw new Error(`Unknown champion type: ${type}`);
	}
}

function mapSkill(raw: ChampionSkillRaw | undefined): ChampionSkill | undefined {
	if (!raw) return undefined;

	return new ChampionSkill(
		raw.id,
		raw.name,
		raw.desc,
		raw.skillicon,
		raw.level
	);
}

export async function normalize(input: ChampionsNormalizationInput): Promise<NormalizationResult<Champion>> {
	const championSkillRaw = await readJSON(input.championsSkillRawPath) as ChampionSkillsRaw;
	const championSlotRaw = await readJSON(input.championSkillsByLevelInfoRawPath) as ChampionSlotRaw;
	const championRaw = await readJSON(input.championsInfoRawPath) as ChampionsRaw;

	const championsTranslationsIndex = {} as Record<string, number>;

	const championsTexts = arrayToId(championRaw.champion);
	const championsSkills = arrayToId(championSkillRaw.champion_skill);

	const champions = Object.entries(groupBy(championSlotRaw.champion_slot, 'id'))
		.reduce((res, entry) => {
			const [key, val] = entry;
			const champ = championsTexts[key];

			const forms = val.map(form => {
				const skills = [
					championsSkills[form.slot_1],
					championsSkills[form.slot_2 ?? '$$_DOES_NOT_EXIST_$$'],
					championsSkills[form.slot_3 ?? '$$_DOES_NOT_EXIST_$$']
				].filter(el => !!el);

				return new ChampionForm(
					mapSkill(skills.filter(s => s.type.toLowerCase() === 'active')[0])!,
					mapSkill(skills.filter(s => s.type.toLowerCase() === 'passive')[0]),
					mapSkill(skills.filter(s => s.type.toLowerCase() === 'exclusive')[0]),
					form.level,
				);
			});

			res.push(new Champion(
				key,
				champ.name,
				champ.illust,
				champ.faceimage,
				champ.background_textid,
				typeMapper(champ.type),
				forms
			));

			return res;
		}, [] as Champion[]);

	champions.forEach((champ: Champion, idx: number) => { championsTranslationsIndex[champ.name] = idx; });

	return {
		entities: champions,
		translationIndex: championsTranslationsIndex,
	};
}
