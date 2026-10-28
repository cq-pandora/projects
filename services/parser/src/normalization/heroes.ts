import {
	HeroBerriesStats, HeroSBW, WeaponType, Hero, HeroClass, HeroType, HeroGender, HeroForm, HeroStats, HeroSkin,
	HeroProfile
} from '@cquest/entities';

import { NormalizationResult } from './common-types';

import {
	readJSON, groupBy, arrayToId, growStats
} from '../util';

import {
	CharacterBerriesRaw, CharacterStatsRaw, CharacterVisualRaw, WeaponsRaw, CharacterCostumesRaw, CharacterProfilesRaw,
	OztalkChatInfoRaw
} from './raw-types/heroes';

import { Weapon, WeaponClassID } from './raw-types/heroes/weapons';

import { CharacterVisual, Type as CharacterType } from './raw-types/heroes/character-visual';
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

function buildHeroTree(start: CharacterVisual, targetsMap: Record<string, CharacterVisual>): CharacterVisual[] {
	if (targetsMap[start.id] === undefined) return [start];

	return [...buildHeroTree(targetsMap[start.id], targetsMap), start];
}

function growBreadStats(base: number, growth: number, grade: number): number {
	return (1 + (grade - 1) / 10) * growStats(base, growth, grade * 10);
}

export async function normalize(input: HeroesNormalizationInput): Promise<NormalizationResult<Hero>> {
	const text = input.localizations;
	const defaultTranslation = text[text.default];
	const characterBerriedStatsRaw = await readJSON(input.characterBerriesStatsRawPath) as CharacterBerriesRaw;
	const characterStatRaw = await readJSON(input.charactersStatsRawPath) as CharacterStatsRaw;
	const characterVisualRaw = await readJSON(input.charactersGeneralInfoRawPath) as CharacterVisualRaw;
	const costumesRaw = await readJSON(input.characterSkinsRawPath) as CharacterCostumesRaw;

	const weaponRaw = await readJSON(input.weaponsRawPath) as WeaponsRaw;
	const profilesRaw = await readJSON(input.characterProfilesRawPath) as CharacterProfilesRaw;
	const oztalkRaw = await readJSON(input.oztalkChatInfoRawPath) as OztalkChatInfoRaw;

	const profileByFormId = arrayToId(profilesRaw.character_profile);
	const oztalkFormIds = new Set(oztalkRaw.oztalk_chat_info.flatMap(chat => chat.chathero ?? []));

	const heroesTranslationsKeysIndex = {} as Record<string, string>;
	const usedIds = new Set<string>();

	// Some skill keys are episode-specific variants (e.g. `TEXT_SKILL_WA_WILD_NATURE_DESC_S2EP3`) that the game ships
	// without any text; the base key holds the text the variant was derived from
	const textKey = <K extends string | null>(key: K): K => {
		if (!key || defaultTranslation[key]?.text) return key;

		const baseKey = key.replace(/_S\d+EP\d+$/, '');

		return (defaultTranslation[baseKey]?.text ? baseKey : key) as K;
	};

	const soulbounds = weaponRaw.weapon.reduce((res, obj) => {
		if (!obj.reqhero_ref) return res;

		if (!res[obj.reqhero_ref]) res[obj.reqhero_ref] = [];

		res[obj.reqhero_ref].push(obj);

		return res;
	}, {} as Record<string, Weapon[]>);

	const maxBerriesStats = characterBerriedStatsRaw.character_add_stat_max.reduce(
		(res, bms) => {
			res[bms.id] = new HeroBerriesStats({
				accuracy: bms.accuracy,
				armor: bms.armor,
				atkPower: bms.attackpower,
				critChance: bms.criticalchance,
				critDmg: bms.criticaldamage,
				evasion: bms.dodge,
				hp: bms.hp,
				resistance: bms.resistance
			});

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

		const baseId = (defaultTranslation[firstForm.name!].text || firstForm.name!).toLowerCase().split(' ').join('_');
		// Different heroes can share a display name (e.g. contract Beatrice and Re:Zero Beatrice)
		const id = usedIds.has(baseId) ? `${baseId}_${firstForm.id.toLowerCase()}` : baseId;

		usedIds.add(id);

		const forms = [];
		let sbws = [] as HeroSBW[];
		let skinsIds = [] as number[];

		for (const formRaw of heroesFormsRaw) {
			const { stats } = formRaw;
			const blockName = textKey(stats.skill_name!);
			const blockDescription = textKey(stats.skill_desc!);
			const passiveName = textKey(stats.skill_subname!);
			const passiveDescription = textKey(stats.skill_subdesc!);

			forms.push(new HeroForm({
				id: formRaw.id,
				name: formRaw.name!,
				image: formRaw.face_tex,
				star: formRaw.grade,
				accuracy: 0,
				armor: growBreadStats(stats.defense, stats.growthdefense, formRaw.grade),
				armorPenetration: 0,
				atkPower: growBreadStats(stats.initialattdmg, stats.growthattdmg, formRaw.grade),
				critChance: stats.critprob,
				critChanceReduction: 0,
				critDmg: stats.critpower,
				dmgReduction: 0,
				evasion: 0,
				hp: growBreadStats(stats.initialhp, stats.growthhp, formRaw.grade),
				lifesteal: 0,
				resistance: growBreadStats(stats.resist, stats.growthresist, formRaw.grade),
				resistancePenetration: 0,
				lore: formRaw.desc!,
				blockImage: stats.skill_icon!,
				skillLvl: formRaw.grade < 4 ? 1 : (formRaw.grade === 6 ? 3 : 2),
				passiveName,
				blockName,
				blockDescription,
				passiveDescription,
				maxBerries: maxBerriesStats[stats.addstatmaxid!],
				recruitDialog: formRaw.gachaspeech,
			}));

			const possibleSkinIds = heroToSkinsIds[formRaw.id];

			skinsIds = [...new Set(skinsIds.concat(possibleSkinIds))];
			const formSbws = (soulbounds[formRaw.id] || []).map(weapon => new HeroSBW({
				id: weapon.id,
				name: weapon.name ?? 'KEY_EMPTY',
				image: weapon.image ?? 'KEY_EMPTY',
				ability: weapon.desc ?? 'KEY_EMPTY',
				star: weapon.grade,
				atkPower: weapon.attdmg,
				atkSpeed: weapon.attspd,
				clazz: weaponClassMapping(weapon.classid)
			}));

			sbws = sbws.concat(formSbws);

			heroesTranslationsKeysIndex[formRaw.name!] = `${defaultTranslation[formRaw.name!].text} (${formRaw.grade}★) name`;
			heroesTranslationsKeysIndex[formRaw.desc!] = `${defaultTranslation[formRaw.name!].text} (${formRaw.grade}★) lore`;
			heroesTranslationsKeysIndex[blockName] = `${defaultTranslation[formRaw.name!].text} (${formRaw.grade}★) block name`;
			heroesTranslationsKeysIndex[blockDescription] = `${defaultTranslation[formRaw.name!].text} (${formRaw.grade}★) block description`;
			heroesTranslationsKeysIndex[passiveName] = `${defaultTranslation[formRaw.name!].text} (${formRaw.grade}★) passive name`;
			heroesTranslationsKeysIndex[passiveDescription] = `${defaultTranslation[formRaw.name!].text} (${formRaw.grade}★) passive description`;

			for (const sbw of formSbws) {
				heroesTranslationsKeysIndex[sbw.name] = `${defaultTranslation[formRaw.name!].text} (${formRaw.grade}★) SBW name`;
				heroesTranslationsKeysIndex[sbw.ability] = `${defaultTranslation[formRaw.name!].text} (${formRaw.grade}★) SBW ability`;
			}
		}

		const skins = skinsIds.filter(Boolean).map(i => {
			const raw = costumesRaw.costume[i];

			return new HeroSkin({
				id: i,
				image: raw.face_tex,
				cost: raw.sellprice,
				name: raw.costumename,
				stats: raw.addstatjson.reduce(
					(res, el) => {
						res[costumeStatMapping(el.Type)] = el.Value;

						return res;
					},
					{} as Record<HeroStats, number>
				)
			});
		});

		// Profiles are keyed by one form id, usually the highest grade one
		const profileRaw = heroesFormsRaw.map(f => profileByFormId[f.id]).reverse().find(Boolean);
		const profile = profileRaw && new HeroProfile({
			age: profileRaw.age,
			birthday: profileRaw.birth,
			hobby: profileRaw.hobby,
			likes: profileRaw.likes,
			hates: profileRaw.hates,
			notes: profileRaw.etc,
			oztalk: heroesFormsRaw.some(f => oztalkFormIds.has(f.id)),
		});

		if (profileRaw) {
			const heroName = defaultTranslation[firstForm.name!].text;

			heroesTranslationsKeysIndex[profileRaw.hobby] = `${heroName} profile hobby`;
			heroesTranslationsKeysIndex[profileRaw.likes] = `${heroName} profile likes`;
			heroesTranslationsKeysIndex[profileRaw.hates] = `${heroName} profile hates`;
			heroesTranslationsKeysIndex[profileRaw.etc] = `${heroName} profile notes`;
		}

		return new Hero({
			id,
			readableId: id,
			clazz: heroClassMapping(firstForm.classid),
			type: heroRarityMapping(firstForm.rarity),
			gender: (firstForm.gender || 'none').toLowerCase() as HeroGender,
			domain: firstForm.domain!,
			forms: forms.sort((a, b) => a.star - b.star),
			sbws,
			skins,
			profile,
		});
	};

	const heroesSorted = Object.entries(
		groupBy(characterVisualRaw.character_visual.filter(c => c.type === CharacterType.Hero), 'classid')
	).reduce((res, [classid, classidHeroes]) => {
		res[classid] = Object.entries(groupBy(classidHeroes, 'rarity')).reduce(
			(rarityRes, [rarity, rarityHeroes]) => {
				const groupedHeroes = groupBy(rarityHeroes, 'subnumber');
				const groupedHeroesTrees = {} as Record<string, CharacterVisual[][]>; // lol

				for (const [k, v] of Object.entries(groupedHeroes)) {
					const targetMap = v.reduce((r, c) => {
						if (c.upgradetargethero == null) return r;

						r[c.upgradetargethero] = c;

						return r;
					}, {} as Record<string, CharacterVisual>);

					const highestGrades = v.filter(c => c.upgradetargethero === null);

					groupedHeroesTrees[k] = highestGrades.map(c => buildHeroTree(c, targetMap));
				}

				const r = [];

				for (const groupKey of Object.getOwnPropertyNames(groupedHeroesTrees)) {
					for (const group of groupedHeroesTrees[groupKey]) {
						const hero = heroToForms(group);

						if (!hero) continue;

						r.push(hero);
					}
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
