import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';

const cmdArgs: CommandArguments = {
	text: {
		required: true,
		description: 'Text to print',
	}
};

export class PrintCommand extends BaseCommand {
	readonly args = cmdArgs;
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.MISC;
	readonly commandName = 'print';
	readonly description = 'Print text anonymously';
	readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) return this.sendUsageInstructions(payload);

		await message.delete();

		const text = args.join(' ');

		await message.channel.send({
			embed: {
				description: text
			}
		});

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'print',
			args: JSON.stringify({ text }),
		};
	}
}

export default new PrintCommand();
