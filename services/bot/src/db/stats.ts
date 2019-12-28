import { Stats } from './models';

import { db as logger } from '../logger';
import { CommandResult } from '../common-types';

export async function submit(stats: CommandResult): Promise<void> {
	try {
		await Stats.create(stats);
	} catch (err) {
		logger.error(`Error submitting stats: ${stats}`);

		throw err;
	}
}
