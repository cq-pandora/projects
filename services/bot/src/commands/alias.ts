import { aliases } from '@cquest/db';

import BaseCommand from './abstract/BaseCommand';
import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ContextValues, ContextType, ArgumentType
} from '../common-types';

const cmdArgs = {
	alias: ArgumentType.string({
		required: true,
		description: 'Suggested alias',
	}),
	context: ArgumentType.choice({
		required: true,
		choices: ContextValues.reduce((r, v) => ({
			...r,
			[v.replace('-', ' ')]: v
		}), {}),
		description: 'Command name, where this alias applies',
	}),
	for: ArgumentType.string({
		required: true,
		description: 'Alias target',
	}),
};

type Arguments = typeof cmdArgs;

export class AliasCommand extends BaseCommand<Arguments> {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = true;
	public readonly category = CommandCategory.UTIL;
	public readonly commandName = 'alias';
	public readonly description = 'Create alias for command/entity (e.g. qt -> Fenrir)';
	public readonly protected = false;

	async run({ reply, args }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { alias, context, for: forr } = args;
		try {
			await aliases.submit(alias, forr, context as ContextType);
		} catch (error) {
			await reply('Unable to submit your alias. Please, contact bot owner.');

			throw error;
		}

		await reply('Alias request submitted');

		return {
			target: forr,
			statusCode: CommandResultCode.SUCCESS,
			args: JSON.stringify({ alias, for: forr })
		};
	}
}

export default new AliasCommand();
