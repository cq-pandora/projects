import { db as logger } from '@cquest/logger';
import { init } from '@cquest/db';

import { IPreloadScript } from '../common-types';
import config from '../config';

export default {
	async run(): Promise<void> {
		await init({
			host: config.db.host,
			port: Number(config.db.port),
			database: config.db.database,
			username: config.db.user,
			password: config.db.password,
			schema: config.db.schema,
		});

		logger.info('Initialized');
	},
	errorCode: 5,
} as IPreloadScript;
