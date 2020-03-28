import {
	HeroBerriesStats, HeroSBW, WeaponType, Hero, HeroClass, HeroType, HeroGender, HeroForm, HeroStats, HeroSkin
} from '@pandora/entities';

import { NormalizationResult } from './common-types';

import { readJSON, groupBy, arrayToId } from '../util';

import {
	CharacterBerriesRaw, CharacterStatsRaw, CharacterVisualRaw, WeaponsRaw, CharacterCostumesRaw
} from './raw-types/heroes';

import { Weapon, WeaponClassID } from './raw-types/heroes/weapons';

import { CharacterVisual } from './raw-types/heroes/character-visual';
import { CostumeStat } from './raw-types/heroes/skins';

import { HeroesNormalizationInput } from './input';

function heroClassMapping(heroClass: string): HeroClass {
	switch (heroClass) {
		case 'CLA_ARCHER': return 'archer';
		case 'CLA_HUNTER': return 'hunter';
		case 'CLA_PALADIN': return 'paladin';
		case 'CLA_PRIEST': return 'priest';
		case 'CLA_WARRIOR': return 'warrior';
		case 'CLA_WIZARD': return 'wizard';
		default: throw new Error(`Unknown hero class: ${heroClass}`);
	}
}

function heroRarityMapping(rarity: string): HeroType {
	switch (rarity) {
		case 'PROMOTION': return 'promotable';
		case 'NORMAL': return 'promotable';
		case 'COLLABO': return 'collab';
		case 'HIDDEN': return 'secret';
		case 'LIMITED': return 'secret';
		case 'LEGENDARY': return 'legendary';
		case 'SUPPORT': return 'support';
		case 'CONTRACT': return 'contract';
		default: throw new Error(`${rarity} is not a hero type`);
	}
}

function weaponClassMapping(clazz: WeaponClassID): WeaponType {
	switch (clazz) {
		case WeaponClassID.CatBow: return 'bow';
		case WeaponClassID.CatGun: return 'gun';
		case WeaponClassID.CatHammer: return 'hammer';
		case WeaponClassID.CatORB: return 'orb';
		case WeaponClassID.CatStaff: return 'staff';
		case WeaponClassID.CatSword: return 'sword';
		default: throw new Error(`${clazz} is not a hero class`);
	}
}

function costumeStatMapping(stats: CostumeStat): HeroStats {
	switch (stats) {
		case CostumeStat.Accuracy: return 'accuracy';
		case CostumeStat.All: return 'all';
		case CostumeStat.Armor: return 'armor';
		case CostumeStat.AttackPower: return 'atk_power';
		case CostumeStat.CriticalChance: return 'crit_chance';
		case CostumeStat.CriticalDamage: return 'crit_dmg';
		case CostumeStat.Dodge: return 'evasion';
		case CostumeStat.HP: return 'hp';
		case CostumeStat.Resistance: return 'resistance';
		default: throw new Error(`${stats} is not a hero stat`);
	}
}

export async function normalize(input: HeroesNormalizationInput): Promise<NormalizationResult<Hero>> {
	const text = input.translation;
	const characterBerriedStatsRaw = await readJSON(input.characterBerriesStatsRawPath) as CharacterBerriesRaw;
	const characterStatRaw = await readJSON(input.charactersStatsRawPath) as CharacterStatsRaw;
	const characterVisualRaw = await readJSON(input.charactersGeneralInfoRawPath) as CharacterVisualRaw;
	const costumesRaw = await readJSON(input.characterSkinsRawPath) as CharacterCostumesRaw;

	const weaponRaw = await readJSON(input.weaponsRawPath) as WeaponsRaw;

	const heroesTranslationsKeysIndex = {} as Record<string, string>;

	const soulbounds = weaponRaw.weapon.reduce((res, obj) => {
		if (!obj.reqhero_ref) return res;

		if (!res[obj.reqhero_ref]) res[obj.reqhero_ref] = [];

		res[obj.reqhero_ref].push(obj);

		return res;
	}, {} as Record<string, Weapon[]>);

	const maxBerriesStats = characterBerriedStatsRaw.character_add_stat_max.reduce(
		(res, bms) => {
			res[bms.id] = new HeroBerriesStats(
				bms.accuracy,
				bms.armor,
				bms.attackpower,
				bms.criticalchance,
				bms.criticaldamage,
				bms.dodge,
				bms.hp,
				bms.resistance
			);

			return res;
		},
		{} as Record<string, HeroBerriesStats>
	);

	const heroToSkinsIds = costumesRaw.costume.reduce(
		(res, el, idx) => el.wearable_charid.reduce(
			(res1, el1) => {
				if (!res1[el1]) {
					res1[el1] = [idx];
				} else {
					res1[el1].push(idx);
				}

				return res1;
			},
			res
		),
		{} as Record<string, number[]>
	);

	const characterStatById = arrayToId(characterStatRaw.character_stat);

	const heroToForms = (heroesRaw: CharacterVisual[]): Hero => {
		const heroesFormsRaw = heroesRaw.map((hero) => {
			hero.stats = characterStatById[hero.default_stat_id];

			return hero;
		});

		const firstForm = heroesFormsRaw[0];

		const id = (text[firstForm.name!].text || firstForm.name!).toLowerCase().split(' ').join('_');

		const forms = [];
		let sbws = [] as HeroSBW[];
		let skinsIds = [] as number[];

		for (const formRaw of heroesFormsRaw) {
			const { stats } = formRaw;

			forms.push(new HeroForm(
				formRaw.id,
				formRaw.name!,
				formRaw.face_tex,
				formRaw.grade,
				0,
				(1 + (formRaw.grade - 1) / 10) * (stats.defense + stats.growthdefense * (formRaw.grade * 10 - 1)),
				0,
				(1 + (formRaw.grade - 1) / 10) * (stats.initialattdmg + stats.growthattdmg * (formRaw.grade * 10 - 1)),
				stats.critprob,
				0,
				stats.critpower,
				0,
				0,
				(1 + (formRaw.grade - 1) / 10) * (stats.initialhp + stats.growthhp * (formRaw.grade * 10 - 1)),
				0,
				(1 + (formRaw.grade - 1) / 10) * (stats.resist + stats.growthresist * (formRaw.grade * 10 - 1)),
				0,
				formRaw.desc!,
				stats.skill_icon!,
				formRaw.grade < 4 ? 1 : (formRaw.grade === 6 ? 3 : 2),
				stats.skill_subname!,
				stats.skill_name!,
				stats.skill_desc!,
				stats.skill_subdesc!,
				maxBerriesStats[stats.addstatmaxid!]
			));

			const possibleSkinIds = heroToSkinsIds[formRaw.id];

			skinsIds = [...new Set(skinsIds.concat(possibleSkinIds))];
			const formSbws = (soulbounds[formRaw.id] || []).map(weapon => new HeroSBW(
				weapon.id,
				weapon.name ?? 'KEY_EMPTY',
				weapon.image ?? 'KEY_EMPTY',
				weapon.desc ?? 'KEY_EMPTY',
				weapon.grade,
				weapon.attdmg,
				weapon.attspd,
				weaponClassMapping(weapon.classid),
			));

			sbws = sbws.concat(formSbws);

			heroesTranslationsKeysIndex[formRaw.name!] = `${text[formRaw.name!].text} (${formRaw.grade}★) name`;
			heroesTranslationsKeysIndex[formRaw.desc!] = `${text[formRaw.name!].text} (${formRaw.grade}★) lore`;
			heroesTranslationsKeysIndex[stats.skill_name!] = `${text[formRaw.name!].text} (${formRaw.grade}★) block name`;
			heroesTranslationsKeysIndex[stats.skill_desc!] = `${text[formRaw.name!].text} (${formRaw.grade}★) block description`;
			heroesTranslationsKeysIndex[stats.skill_subname!] = `${text[formRaw.name!].text} (${formRaw.grade}★) passive name`;
			heroesTranslationsKeysIndex[stats.skill_subdesc!] = `${text[formRaw.name!].text} (${formRaw.grade}★) passive description`;

			for (const sbw of formSbws) {
				heroesTranslationsKeysIndex[sbw.name] = `${text[formRaw.name!].text} (${formRaw.grade}★) SBW name`;
				heroesTranslationsKeysIndex[sbw.ability] = `${text[formRaw.name!].text} (${formRaw.grade}★) SBW ability`;
			}
		}

		const skins = skinsIds.filter(Boolean).map(i => {
			const raw = costumesRaw.costume[i];

			return new HeroSkin(
				i,
				raw.face_tex,
				raw.sellprice,
				raw.costumename,
				raw.addstatjson.reduce(
					(res, el) => {
						res[costumeStatMapping(el.Type)] = el.Value;

						return res;
					},
					{} as Record<HeroStats, number>
				)
			);
		});

		return new Hero(
			id,
			id,
			heroClassMapping(firstForm.classid),
			heroRarityMapping(firstForm.rarity),
			(firstForm.gender || 'none').toLowerCase() as HeroGender,
			firstForm.domain!,
			forms.sort((a, b) => a.star - b.star),
			sbws,
			skins
		);
	};

	const heroesSorted = Object.entries(
		groupBy(characterVisualRaw.character_visual.filter(c => c.type === 'HERO'), 'classid')
	).reduce((res, [classid, classidHeroes]) => {
		res[classid] = Object.entries(groupBy(classidHeroes, 'rarity')).reduce(
			(rarityRes, [rarity, rarityHeroes]) => {
				if ('ADVENTURER'.toLowerCase() === (rarity || '').toLowerCase()) {
					rarityRes[rarity] = rarityHeroes.map(hero => heroToForms([hero])).filter(hero => !!hero);

					return rarityRes;
				}

				const groupedHeroes = groupBy(rarityHeroes, 'subnumber');
				const r = [];

				for (const groupKey of Object.getOwnPropertyNames(groupedHeroes)) {
					const hero = heroToForms(groupedHeroes[groupKey]);

					if (!hero) continue;

					r.push(hero);
				}

				rarityRes[rarity] = r;

				return rarityRes;
			}, {} as Record<string, Hero[]>
		);

		return res;
	}, {} as Record<string, Record<string, Hero[]>>);

	const translationIndex = {} as Record<string, string>;
	const heroes = [] as Hero[];

	for (const clazz of Object.keys(heroesSorted)) {
		for (const rarity of Object.keys(heroesSorted[clazz])) {
			for (const hero of heroesSorted[clazz][rarity]) {
				const heroId = heroes.push(hero) - 1;

				for (let formId = 0; formId < hero.forms.length; formId++) {
					translationIndex[hero.forms[formId].name] = `${heroId}.${formId}`;
				}

				for (let skinId = 0; skinId < hero.skins.length; skinId++) {
					translationIndex[hero.skins[skinId].name] = `${heroId}.${skinId}`;
				}
			}
		}
	}

	return {
		entities: heroes,
		translationIndex,
		translationsKeys: heroesTranslationsKeysIndex,
	};
}
