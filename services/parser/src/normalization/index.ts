import { readdirSync, writeFile, mkdirSync } from 'node:fs';
import { promisify } from 'node:util';

import {
	Hero, Berry, Champion, SpSkill, Boss, Bread, Sigil, Goddess, Faction, Fish, FishingGear, TranslationIndexSection,
	TranslationIndices, TranslationIndex, GenericConstructor, Serialize, Translations, Interaction, TranslationsMeta,
	Scarecrow, Accessory, ChampionBond
} from '@cquest/entities';

import { resolve as pathResolve } from 'node:path';

import { paths } from '../config';
import { gameVersion } from '../util';
import { makeLogger } from '../logger';

import * as normalizations from './normalizations';
import { UniversalNormalizationInput, Localizations, locales } from './input';
import { NormalizationResult } from './common-types';

const writeFileAsync = promisify(writeFile);

function absolute(partName: string): string {
	return pathResolve(paths.decryptOutputDir, `get_${partName}.json`);
}

const TEXT_SHARD_REGEX = /^get_(text\d+|textdialogue\d+)_([a-z]{2}_[a-z]{2})_(\d+)\.json$/;

/**
 * Game splits translations into `get_<group>_<locale>_<shard>` sheets and adds groups/shards over time
 * (e.g. `textdialogue3_*_3` appeared with the Epilogue), so they are discovered instead of listed
 */
function textShards(locale: string): string[] {
	return readdirSync(paths.decryptOutputDir)
		.map(file => TEXT_SHARD_REGEX.exec(file))
		.filter((match): match is RegExpExecArray => match !== null && match[2] === locale)
		.map(([file, group, , shard]) => ({ file, group, shard: Number(shard) }))
		.sort((a, b) => a.group.localeCompare(b.group) || a.shard - b.shard)
		.map(({ file }) => pathResolve(paths.decryptOutputDir, file));
}

type NormalizationFunction<T> = (input: UniversalNormalizationInput) => Promise<NormalizationResult<T>>;
type NormalizationEntry<T> = [GenericConstructor<T> | string, NormalizationFunction<T>];

const toNormalize = {
	heroes: [Hero, normalizations.normalizeHeroes],
	breads: [Bread, normalizations.normalizeBreads],
	berries: [Berry, normalizations.normalizeBerries],
	sigils: [Sigil, normalizations.normalizeSigils],
	goddesses: [Goddess, normalizations.normalizeGoddesses],
	factions: [Faction, normalizations.normalizeFactions],
	champions: [Champion, normalizations.normalizeChampions],
	sp_skills: [SpSkill, normalizations.normalizeSpSkills],
	bosses: [Boss, normalizations.normalizeBosses],
	fishes: [Fish, normalizations.normalizeFish],
	fishing_gear: [FishingGear, normalizations.normalizeFishingGear],
	portraits: ['Portraits', normalizations.normalizePortraits],
	inheritance: ['Inheritance', normalizations.normalizeInheritance],
	interactions: [Interaction, normalizations.normalizeInteractions],
	scarecrows: [Scarecrow, normalizations.normalizeScarecrows],
	accessories: [Accessory, normalizations.normalizeAccessories],
	champion_bond: [ChampionBond, normalizations.normalizeChampionBond],
} as Record<TranslationIndexSection, NormalizationEntry<object>>;

const logger = makeLogger('normalize');

export default async function normalize(): Promise<void> {
	const version = await gameVersion();

	logger.verbose(`Using game version ${version}`);

	logger.verbose('Started translations normalization');

	mkdirSync(pathResolve(paths.informationOutputDir, 'translations'), { recursive: true });

	const localizations = { default: 'en_us' } as Localizations;

	for (const locale of locales) {
		const translations = await normalizations.normalizeTranslations({
			textsRawPaths: textShards(locale),
		});

		localizations[locale] = translations;

		await writeFileAsync(
			pathResolve(paths.informationOutputDir, 'translations', `${locale}.json`),
			Serialize<Translations>(translations, 'Translations')
		);

		logger.verbose(`Normalized ${locale} locale`);
	}

	const translationsMeta = new TranslationsMeta({
		locales
	});

	await writeFileAsync(
		pathResolve(paths.informationOutputDir, 'translations', 'meta.json'),
		Serialize(translationsMeta, TranslationsMeta)
	);

	logger.verbose('Normalized translations');

	const filenames: UniversalNormalizationInput = {
		accessoryEarringsRawPath: absolute('accessory_earring'),
		accessoryNecklacesRawPath: absolute('accessory_necklace'),
		accessoryOptionsRawPath: absolute('accessory_option'),
		berriesRawPath: absolute('addstatitem'),
		breadsRawPath: absolute('bread'),
		championBondRawPath: absolute('champion_link_level_stat_unlock'),
		championSkillsByLevelInfoRawPath: absolute('champion_slot'),
		championsInfoRawPath: absolute('champion'),
		championsSkillRawPath: absolute('champion_skill'),
		characterBerriesStatsRawPath: absolute('character_addstatmax'),
		characterProfilesRawPath: absolute('character_profile'),
		characterSkinsRawPath: absolute('costume'),
		charactersGeneralInfoRawPath: absolute('character_visual'),
		charactersStatsRawPath: absolute('character_stat'),
		factionsRawPath: absolute('champion_domain'),
		fishesRawPath: absolute('fish'),
		fisheriesRawPath: absolute('fishery'),
		itemsRawPath: absolute('item'),
		materialsRawPath: absolute('material'),
		randomBoxesRawPath: absolute('randombox'),
		fishingGearRawPath: absolute('fishinggear'),
		goddessesRawPath: absolute('sister'),
		inheritanceRawPath: absolute('character_epiclevelstat'),
		portraitsRawPath: absolute('illustcollection'),
		portraitsDataRawPath: absolute('portraitdata'),
		sigilsRawPath: absolute('carvestone'),
		sigilsSetsRawPath: absolute('carvestone_set'),
		sigilsStatsRawPath: absolute('carvestone_option'),
		spSkillsRawPath: absolute('spskill'),
		weaponsRawPath: absolute('weapon'),
		oztalkChatInfoRawPath: absolute('oztalkchatinfo'),
		interactionsRawPath: absolute('hero_easteregg'),
		dummyRawPath: absolute('dummy'),
		localizations,
	};

	const translationIndices = {} as TranslationIndices;

	for (const [type, [ctor, normalizer]] of Object.entries(toNormalize)) {
		logger.verbose(`Started ${type} normalization`);

		const result = await normalizer(filenames);

		await writeFileAsync(pathResolve(paths.informationOutputDir, `${type}.json`), Serialize(result.entities, ctor));

		if (result.translationIndex) {
			translationIndices[type as TranslationIndexSection] = Object.entries(result.translationIndex)
				.map(e => {
					const indices = [];

					const defaultLocale = localizations[localizations.default];
					const defaultText = defaultLocale[e[0]]?.text;

					if (!defaultText) {
						logger.warn(`No default translation available for ${e[0]}`);
					}

					const defaultIndex = new TranslationIndex({
						locale: localizations.default,
						key: e[0],
						path: e[1].toString(),
						text: defaultText ?? e[0],
						version,
						original: true
					});

					for (const locale of locales) {
						if (locale === localizations.default) continue;

						const translation = localizations[locale];
						const text = translation[e[0]]?.text;

						if (!text) {
							logger.warn(`No translation available for ${e[0]}`);
						}

						// if (text === defaultText) {
						// logger.warn(`${locale} text is the same as default text for key ${e[0]}`);
						// continue;
						// }

						indices.push(
							new TranslationIndex({
								key: e[0],
								path: e[1].toString(),
								text: text ?? e[0],
								version,
								original: true,
								locale,
							})
						);
					}

					indices.push(defaultIndex);

					return indices;
				})
				.flat();
		}

		if (result.translationsKeys) {
			await writeFileAsync(
				pathResolve(paths.informationOutputDir, `${type}_translations_indices.json`),
				JSON.stringify(result.translationsKeys, null, 4),
			);
		}

		logger.verbose(`Normalized ${type}`);
	}

	await writeFileAsync(
		pathResolve(paths.informationOutputDir, 'translations_indices.json'),
		Serialize<TranslationIndices>(translationIndices, 'TranslationIndices')
	);
}
