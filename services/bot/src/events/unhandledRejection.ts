import { DiscordAPIError } from 'discord.js';
import logger from '@cquest/logger';

const ERROR_CODES = [
	10008, // UNKNOWN_MESSAGE
	50013, // MISSING_PERMISSIONS
	50003, // CANNOT_EXECUTE_ON_DM
];

const IGNORE_RAW = [
	'Two factor is required for this operation',
];

export default (error: unknown): void => {
	// Ignore discord api errors related to embed
	if (error instanceof DiscordAPIError && (ERROR_CODES.includes(error.code) || IGNORE_RAW.includes(error.message))) {
		return;
	}

	logger.error('Unhandled exception!', error);
};
