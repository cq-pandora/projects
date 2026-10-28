import { HeroClass, SpSkill, SpSkillForm } from '@cquest/entities';

import { NormalizationResult } from './common-types';

import { readJSON } from '../util';

import { Class, SPSkillsRaw, SPSkillType } from './raw-types/sp-skills';

import { SpSkillNormalizationInput } from './input';

const ID_PREFIX_CLASSES: Record<string, HeroClass> = {
	AR: 'archer',
	HU: 'hunter',
	PA: 'paladin',
	PR: 'priest',
	WA: 'warrior',
	WI: 'wizard',
};

function classMapper(clazz: Class, id: string): HeroClass {
	switch (clazz) {
		case Class.ClaArcher: return 'archer';
		case Class.ClaWizard: return 'wizard';
		case Class.ClaPriest: return 'priest';
		case Class.ClaPaladin: return 'paladin';
		case Class.ClaHunter: return 'hunter';
		case Class.ClaWarrior: return 'warrior';
		default: {
			// Hero-unique skills (BRISEIS, LIMITED_BRSK_*) carry the owner instead of a class;
			// their id prefix (`PA_`, `WA_`) holds the class
			const clazzByPrefix = ID_PREFIX_CLASSES[id.split('_')[0]];

			if (!clazzByPrefix) throw new Error(`Unsupported SP skill class: ${clazz} (${id})`);

			return clazzByPrefix;
		}
	}
}

export async function normalize(input: SpSkillNormalizationInput): Promise<NormalizationResult<SpSkill>> {
	const spSkillsRaw = await readJSON(input.spSkillsRawPath) as SPSkillsRaw;

	const spMax = spSkillsRaw.sp_skill.filter(s => s.unlockcond.next_id === 'MAX'
		&& ![Class.Kof, Class.ClaObject, Class.LimitedEr05].includes(s.class));

	const spSkillsTranslationIndex = {} as Record<string, number>;

	const trees = spMax.map(s => {
		const spTree = [s];

		for (
			let skill = spSkillsRaw.sp_skill.find(c => c.unlockcond.next_id === spTree[spTree.length - 1].id);
			skill;
			skill = spSkillsRaw.sp_skill.find(c => c.unlockcond.next_id === spTree[spTree.length - 1].id)
		) {
			spTree.push(skill);
		}

		return spTree.reverse();
	});

	// Some hero-unique skills (Briseis) list each level as a separate unlinked `level: 1` row sharing one name,
	// so trees with the same class and name are joined in id order (`_LV1`, `_LV2`) and renumbered
	const treesByName = new Map<string, typeof trees>();

	for (const tree of trees) {
		const key = `${tree[0].class}:${tree[0].name}`;

		treesByName.set(key, [...(treesByName.get(key) ?? []), tree]);
	}

	const spSkills = [...treesByName.values()].map(group => {
		const rows = group.length > 1
			? group.sort((a, b) => a[0].id.localeCompare(b[0].id)).flat()
			: group[0];
		const [first] = rows;

		const forms = rows.map((sk, idx) => new SpSkillForm(
			{
				level: group.length > 1 ? idx + 1 : sk.level,
				description: sk.desc,
				shortDescription: sk.simpledesc,
				image: sk.icon,
			}
		));

		return new SpSkill({
			id: (first.name || '').toLowerCase(),
			name: first.name,
			clazz: classMapper(first.class, first.id),
			type: first.type === SPSkillType.Normal ? 'normal' : 'ultimate',
			forms
		});
	});

	spSkills.forEach((skill, idx) => {
		spSkillsTranslationIndex[skill.name] = idx;
	});

	return {
		entities: spSkills,
		translationIndex: spSkillsTranslationIndex,
	};
}
