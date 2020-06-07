import { aliases } from '@cquest/db';
import logger from '@cquest/logger';

import { ContextType, IPreloadScript } from '../common-types';

import config from '../config';

export default {
	run: async (): Promise<void> => {
		const databaseAliases = await aliases.get();

		let validAliases = 0;

		for (const { context, alias = '', for: target } of databaseAliases) {
			if (!context) {
				logger.warn(`Invalid alias without context: ${alias} => ${target}`);
			} else {
				config.aliases.set(context as ContextType, alias, target);
				validAliases += 1;
			}
		}

		logger.verbose(`Loaded ${validAliases}/${databaseAliases.length} aliases`);
	},
	errorCode: 3,
} as IPreloadScript;
