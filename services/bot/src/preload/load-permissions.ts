import { permissions } from '@pandora/db';

import config from '../config';
import { IPreloadScript } from '../common-types';

export default {
	run: async (): Promise<void> => {
		for (const p of await permissions.list()) {
			config.permissions.set(p.serverId, p.targetType, p.targetId, p.mode, p.commands, p.priority);
		}
	},
	errorCode: 5,
} as IPreloadScript;
