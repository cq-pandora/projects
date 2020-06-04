import compare from 'compare-versions';

import logger from '@pandora/logger';
import { translations } from '@pandora/db';

import { localizations } from '../cq-data';
import { IPreloadScript } from '../common-types';

export default {
	async run(): Promise<void> {
		const dbTranslations = await translations.get();

		let validTranslations = 0;

		for (const translation of dbTranslations) {
			const { key, version, locale } = translation;

			const trans = localizations[locale];

			const { version: accumulatorVersion } = trans[key];

			if (compare(version, accumulatorVersion) >= 0) {
				trans[key] = translation;
				validTranslations += 1;
			} else {
				logger.warn(`Ignoring outdated translation for key ${key} (${version} < ${accumulatorVersion})`);
			}
		}

		logger.verbose(`Loaded ${validTranslations}/${dbTranslations.length} translations`);
	},
	errorCode: 1,
} as IPreloadScript;
