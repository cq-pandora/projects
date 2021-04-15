import logger from '@cquest/logger';
import {resolveVersion} from '@cquest/version-resolver';

import config from '../config';
import { IPreloadScript } from '../common-types';

export default {
	async run(): Promise<void> {
		config.gameVersion = await resolveVersion();

		logger.verbose(`Using game version: ${config.gameVersion}`);
	},
	errorCode: 2,
} as IPreloadScript;
