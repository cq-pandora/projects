import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';

import logger from '@cquest/logger';

import { IPreloadScript } from '../common-types';
import commands from '../commands';
import config from '../config';

const rest = new REST({ version: '10' }).setToken(config.token);
const isDev = process.env.NODE_ENV !== 'production';

export default {
	run: async (): Promise<void> => {
		const slashCommands = [];

		for (const command of commands) {
			config.commands[command.commandName] = command;

			for (const alias of command.aliases) {
				config.commands[alias] = command;
			}

			slashCommands.push(...command.slashCommandJSON());
		}

		await rest.put(
			isDev
				? Routes.applicationGuildCommands(config.appId, config.guildId)
				: Routes.applicationCommands(config.appId),
			{ body: slashCommands },
		);

		logger.verbose(`Loaded ${Object.keys(config.commands).length} commands to ${isDev ? 'guild' : 'global'} collection`);
	},
	errorCode: 4,
} as IPreloadScript;

module.exports.errorCode = 4;
