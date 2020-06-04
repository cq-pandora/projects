import axios from 'axios';

import logger from '@pandora/logger';
import config from '../config';
import { IPreloadScript } from '../common-types';

const GET_VERSION_RE = /Latest Version:\s*<\/strong>\s*<\/p>\s*<p>\s*(\d+\.\d+\.\d+).*<\/p>/;

export default {
	async run(): Promise<void> {
		const { data } = await axios.get('https://apkpure.com/crusaders-quest/com.nhnent.SKQUEST');

		const [, version] = (data as string).match(GET_VERSION_RE) as RegExpMatchArray;

		config.gameVersion = version;

		logger.verbose(`Using game version: ${config.gameVersion}`);
	},
	errorCode: 2,
} as IPreloadScript;
