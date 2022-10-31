import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';

import logger from '@cquest/logger';

import { IPreloadScript } from '../common-types';
import commands from '../commands';
import config from '../config';

const rest = new REST({ version: '10' }).setToken(config.token);

export default {
	run: async (): Promise<void> => {
		const slashCommands = [];

		for (const command of commands) {
			config.commands[command.commandName] = command;
			slashCommands.push(command.slashCommand().toJSON());
		}

		await rest.put(
			Routes.applicationCommands(config.appId),
			{ body: slashCommands },
		);

		logger.verbose(`Loaded ${Object.keys(config.commands).length} commands`);
	},
	errorCode: 4,
} as IPreloadScript;

module.exports.errorCode = 4;
