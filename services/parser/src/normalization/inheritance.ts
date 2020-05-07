import {
	Inheritance, HeroClass, isInheritanceLevel, InheritanceStats
} from '@pandora/entities';

import { NormalizationResult } from './common-types';

import { readJSON } from '../util';

import { InheritanceRaw, Class } from './raw-types/inheritance';

import { InheritanceNormalizationInput } from './input';

function classMapper(clazz: Class): HeroClass {
	switch (clazz) {
		case Class.ClaArcher: return 'archer';
		case Class.ClaHunter: return 'hunter';
		case Class.ClaPaladin: return 'paladin';
		case Class.ClaPriest: return 'priest';
		case Class.ClaWarrior: return 'warrior';
		case Class.ClaWizard: return 'wizard';
		default: throw new Error(`Unknown hero class ${clazz}`);
	}
}

export async function normalize(input: InheritanceNormalizationInput): Promise<NormalizationResult<Inheritance>> {
	const inheritanceRaw = await readJSON(input.inheritanceRawPath) as InheritanceRaw;

	const inheritance = {
		archer: {},
		hunter: {},
		paladin: {},
		priest: {},
		warrior: {},
		wizard: {},
	} as Inheritance;

	for (const statsRaw of inheritanceRaw.character_epic_level_stat) {
		if (!isInheritanceLevel(statsRaw.epiclevel)) {
			throw new Error(`Bad inheritance level ${statsRaw.epiclevel}. It seems that new levels were added.`);
		}

		inheritance[classMapper(statsRaw.class)][statsRaw.epiclevel] = new InheritanceStats({
			accuracy: statsRaw.accuracyrate,
			armor: statsRaw.def,
			armorPenetration: statsRaw.penetratedef,
			atkPower: statsRaw.atkpower,
			critChance: statsRaw.critrate,
			critChanceReduction: statsRaw.critdodgerate,
			critDmg: statsRaw.critpowerrate,
			dmgReduction: statsRaw.receivedmgrate,
			evasion: statsRaw.dodgerate,
			hp: statsRaw.maxhp,
			lifesteal: statsRaw.vamprate,
			resistance: statsRaw.rst,
			resistancePenetration: statsRaw.penetraterst
		});
	}

	return {
		entities: [inheritance],
	};
}
