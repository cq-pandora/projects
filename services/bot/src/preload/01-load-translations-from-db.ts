import compare from 'compare-versions';

import logger from '../logger';
import { translations } from '../cq-data';
import { get as getTranslation } from '../db/translations';
import { IPreloadScript } from '../common-types';

export default {
	async run(): Promise<void> {
		const dbTranslations = await getTranslation();

		let validTranslations = 0;

		for (const translation of dbTranslations) {
			const { key, version } = translation;
			const { version: accumulatorVersion } = translations[key];

			if (compare(version, accumulatorVersion) >= 0) {
				translations[key] = translation;
				validTranslations += 1;
			} else {
				logger.warn(`Ignoring outdated translation for key ${key} (${version} < ${accumulatorVersion})`);
			}
		}

		logger.verbose(`Loaded ${validTranslations}/${dbTranslations.length} translations`);
	},
	errorCode: 1,
} as IPreloadScript;
