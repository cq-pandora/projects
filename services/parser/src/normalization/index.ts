/* eslint-disable @typescript-eslint/camelcase */
import { writeFile } from 'fs';
import { promisify } from 'util';

import {
	Hero, Berry, Champion, SpSkill, Boss, Bread, Sigil, Goddess, Faction, Fish, FishingGear, TranslationIndexSection,
	TranslationIndices, TranslationIndex, GenericConstructor, Serialize, Translations, Interaction
} from '@pandora/entities';

import { resolve as pathResolve } from 'path';

import { paths } from '../config';
import { gameVersion } from '../util';
import { makeLogger } from '../logger';

import * as normalizations from './normalizations';
import { UniversalNormalizationInput } from './input';
import { NormalizationResult } from './common-types';

const writeFileAsync = promisify(writeFile);

function absolute(partName: string): string {
	return pathResolve(paths.decryptOutputDir, `get_${partName}.json`);
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
} as Record<TranslationIndexSection, NormalizationEntry<object>>;

const logger = makeLogger('normalize');

export default async function normalize(): Promise<void> {
	const version = await gameVersion();

	logger.verbose(`Using game version ${version}`);

	logger.verbose('Started translations normalization');

	const translations = await normalizations.normalizeTranslations({
		textsRawPaths: [
			'text1_en_us_0',
			'text1_en_us_1',
			'text1_en_us_2',
			'text2_en_us_0',
			'text2_en_us_1',
			'textdialogue1_en_us_0',
			'textdialogue1_en_us_1',
			'textdialogue1_en_us_2',
			'textdialogue2_en_us_0',
			'textdialogue2_en_us_1',
		].map(absolute),
	});

	await writeFileAsync(
		pathResolve(paths.informationOutputDir, 'translations.json'),
		Serialize<Translations>(translations, 'Translations')
	);

	logger.verbose('Normalized translations');

	const filenames: UniversalNormalizationInput = {
		berriesRawPath: absolute('addstatitem'),
		breadsRawPath: absolute('bread'),
		championSkillsByLevelInfoRawPath: absolute('champion_slot'),
		championsInfoRawPath: absolute('champion'),
		championsSkillRawPath: absolute('champion_skill'),
		characterBerriesStatsRawPath: absolute('character_addstatmax'),
		characterSkinsRawPath: absolute('costume'),
		charactersGeneralInfoRawPath: absolute('character_visual'),
		charactersStatsRawPath: absolute('character_stat'),
		factionsRawPath: absolute('champion_domain'),
		fishesRawPath: absolute('fish'),
		fishingGearRawPath: absolute('fishinggear'),
		goddessesRawPath: absolute('sister'),
		inheritanceRawPath: absolute('character_epiclevelstat'),
		portraitsRawPath: absolute('illustcollection'),
		sigilsRawPath: absolute('carvestone'),
		sigilsSetsRawPath: absolute('carvestone_set'),
		sigilsStatsRawPath: absolute('carvestone_option'),
		spSkillsRawPath: absolute('spskill'),
		weaponsRawPath: absolute('weapon'),
		interactionsRawPath: absolute('hero_easteregg'),
		translation: translations,
	};

	const translationIndices = {} as TranslationIndices;

	for (const [type, [ctor, normalizer]] of Object.entries(toNormalize)) {
		logger.verbose(`Started ${type} normalization`);

		const result = await normalizer(filenames);

		await writeFileAsync(pathResolve(paths.informationOutputDir, `${type}.json`), Serialize(result.entities, ctor));

		if (result.translationIndex) {
			translationIndices[type as TranslationIndexSection] = Object.entries(result.translationIndex)
				.map(e => {
					const text = translations[e[0]]?.text;

					if (!text) {
						logger.warn(`No translation available for ${e[0]}`);
					}

					return new TranslationIndex(
						e[0],
						e[1].toString(),
						text ?? e[0],
						version,
						true
					);
				});
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
