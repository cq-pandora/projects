import logger from '@cquest/logger';
import {
	init, setDataSource, setAliasProvider, FileDataSource
} from '@cquest/data-provider';

import { IPreloadScript } from '../common-types';
import config from '../config';

export default {
	async run(): Promise<void> {
		setAliasProvider(config.aliases);

		const dataSource = new FileDataSource(config.parsedData);

		setDataSource(dataSource);

		await init();

		logger.verbose('Initialized data');
	},
	errorCode: 7,
} as IPreloadScript;
