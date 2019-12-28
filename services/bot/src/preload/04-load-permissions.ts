import config from '../config';
import { list } from '../db/permissions';
import { IPreloadScript } from '../common-types';

export default {
	run: async (): Promise<void> => {
		for (const p of await list()) {
			config.permissions.set(p.serverId, p.targetType, p.targetId, p.mode, p.commands, p.priority);
		}
	},
	errorCode: 5,
} as IPreloadScript;
