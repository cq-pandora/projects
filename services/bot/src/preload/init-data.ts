import logger from '@cquest/logger';
import {
	init, setDataSource, setAliasProvider, FileDataSource, addTranslationIndices
} from '@cquest/data-provider';
import { DeserializeSingle, TranslationIndices } from '@cquest/entities';

import { IPreloadScript } from '../common-types';
import config from '../config';
import { loadRootConfig } from '../util/functions';

export default {
	async run(): Promise<void> {
		setAliasProvider(config.aliases);

		const dataSource = new FileDataSource(config.parsedData);

		setDataSource(dataSource);

		try {
			const defaultAdditionalIndicesPath = loadRootConfig('custom_translation_indices.json', config.overridesPath);
			const indices = DeserializeSingle<TranslationIndices>(defaultAdditionalIndicesPath, 'TranslationIndices');

			addTranslationIndices(indices);
		} catch (e: any) {
			logger.warn(`Unable to load custom translation indices: ${e.message}`);
		}

		await init();

		logger.verbose('Initialized data');
	},
	errorCode: 7,
} as IPreloadScript;
