import { IPreloadScript } from '../common-types';
import commands from '../commands';

import logger from '../logger';
import config from '../config';

export default {
	run: async (): Promise<void> => {
		for (const command of commands) {
			config.commands[command.commandName] = command;
		}

		logger.verbose(`Loaded ${Object.keys(config.commands).length} commands`);
	},
	errorCode: 4,
} as IPreloadScript;

module.exports.errorCode = 4;
