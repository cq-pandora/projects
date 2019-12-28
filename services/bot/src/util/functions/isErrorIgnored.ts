import { DiscordAPIError } from 'discord.js';

const IGNORED_ERROR_CODES = [
	10008, // UNKNOWN_MESSAGE
	50013, // MISSING_PERMISSIONS
	50003, // CANNOT_EXECUTE_ON_DM
];

const IGNORE_RAW = [
	'Two factor is required for this operation',
];


export default function isErrorIgnored(error: any): boolean {
	return (
		error instanceof DiscordAPIError && (
			IGNORED_ERROR_CODES.includes(error.code)
			|| IGNORE_RAW.includes(error.message)
		)
	);
}
