import { ActivityType, Client } from 'discord.js';
import logger from '@cquest/logger';

import preloadScripts from './preload';

import config from './config';

import unhandledRejection from './events/unhandledRejection';
import interactionCreate from './events/interactionCreate';

process.on('unhandledRejection', unhandledRejection);

(async (): Promise<void> => {
	logger.info(`Starting ${config.package.name}@${config.package.version}`);

	const client = new Client({
		intents: [],
	});

	logger.verbose('Executing preload scripts');

	for (const script of preloadScripts) {
		try {
			await script.run();
		} catch (e) {
			logger.error('Unable to start app: ', e);

			process.exit(script.errorCode);
		}
	}

	logger.verbose('Finished executing preload scripts');

	logger.info(`Logging in with token "${config.token}"...`);
	await client.login(config.token);

	logger.verbose('Loading events...');

	client.on('interactionCreate', interactionCreate(client));
	client.on('shardReconnecting', () => { logger.warn('Connection to Discord interrupted. Reconnecting...'); });
	client.on('ready', () => {
		logger.info(`Logged in as ${client.user!.tag}`);
		client.user!.setActivity('with Slash Commands!', { type: ActivityType.Playing });
	});

	logger.verbose('Finished loading events');
})();
