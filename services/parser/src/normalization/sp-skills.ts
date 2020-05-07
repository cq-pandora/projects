import { HeroClass, SpSkill, SpSkillForm } from '@pandora/entities';

import { NormalizationResult } from './common-types';

import { readJSON } from '../util';

import { Class, SPSkillsRaw, SPSkillType } from './raw-types/sp-skills';

import { SpSkillNormalizationInput } from './input';

function classMapper(clazz: Class): HeroClass {
	switch (clazz) {
		case Class.ClaArcher: return 'archer';
		case Class.ClaWizard: return 'wizard';
		case Class.ClaWarrior: return 'warrior';
		case Class.ClaPriest: return 'priest';
		case Class.ClaPaladin: return 'paladin';
		case Class.ClaHunter: return 'hunter';
		default: throw new Error(`Unsupported SP skill class: ${clazz}`);
	}
}

export async function normalize(input: SpSkillNormalizationInput): Promise<NormalizationResult<SpSkill>> {
	const spSkillsRaw = await readJSON(input.spSkillsRawPath) as SPSkillsRaw;

	const spMax = spSkillsRaw.sp_skill.filter(s => s.unlockcond.next_id === 'MAX'
		&& ![Class.Kof, Class.ClaObject, Class.LimitedEr05].includes(s.class));

	const spSkillsTranslationIndex = {} as Record<string, number>;

	const spSkills = spMax.map(s => {
		const spTree = [s];

		for (
			let skill = spSkillsRaw.sp_skill.filter(c => c.unlockcond.next_id === spTree[spTree.length - 1].id)[0];
			skill;
			[skill] = spSkillsRaw.sp_skill.filter(c => c.unlockcond.next_id === spTree[spTree.length - 1].id)
		) {
			spTree.push(skill);
		}

		const forms = spTree.reverse().map(sk => new SpSkillForm(
			{
				level: sk.level, description: sk.desc, shortDescription: sk.simpledesc, image: sk.icon
			}
		));

		return new SpSkill({
			id: (s.name || '').toLowerCase(),
			name: s.name,
			clazz: classMapper(s.class),
			type: s.type === SPSkillType.Normal ? 'normal' : 'ultimate',
			forms
		});
	});

	spSkills.forEach((skill, idx) => { spSkillsTranslationIndex[skill.name] = idx; });

	return {
		entities: spSkills,
		translationIndex: spSkillsTranslationIndex,
	};
}
