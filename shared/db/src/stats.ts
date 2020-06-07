import { db as logger } from '@cquest/logger';
import { CommandResult } from '@cquest/entities';

import { Stats } from './models';

export async function submit(stats: CommandResult): Promise<void> {
	try {
		const stat = Stats.create(stats);

		await stat.save();
	} catch (err) {
		logger.error(`Error submitting stats: ${stats}`);

		throw err;
	}
}
