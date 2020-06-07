import { aliases } from '@cquest/db';

import BaseCommand from './abstract/BaseCommand';
import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments, ContextValues, ContextType
} from '../common-types';

const commandArgs: CommandArguments = {
	alias: {
		required: true,
		description: 'Suggested alias. **Important**: alias can be single word only',
	},
	context: {
		required: true,
		description: `Command name, where this alias applies. Can be one of: ${ContextValues.join(', ')}`,
	},
	for: {
		required: true,
		description: 'Alias target',
	}
};

export class AliasCommand extends BaseCommand {
	public readonly args = commandArgs;
	public readonly argsOrderMatters = true;
	public readonly category = CommandCategory.UTIL;
	public readonly commandName = 'alias';
	public readonly description = 'Create alias for command/entity (e.g. qt -> Fenrir)';
	public readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { args, message } = payload;

		if (args.length < 3) {
			return this.sendUsageInstructions(payload);
		}

		const [alias, ctx, ...rest] = args;
		const forr = rest.join(' ');

		try {
			await aliases.submit(alias, forr, ctx as ContextType);
		} catch (error) {
			await message.channel.send('Unable to submit your alias. Please, contact bot owner.');

			throw error;
		}

		await message.channel.send('Alias request submitted');

		return {
			target: forr,
			statusCode: CommandResultCode.SUCCESS,
			args: JSON.stringify({ alias, for: forr })
		};
	}
}

export default new AliasCommand();
