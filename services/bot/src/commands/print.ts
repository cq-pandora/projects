import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';

const cmdArgs = {
	text: ArgumentType.string({
		required: true,
		description: 'Text to print',
	}),
};

type Arguments = typeof cmdArgs;
export class PrintCommand extends BaseCommand<Arguments> {
	readonly args = cmdArgs;
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.MISC;
	readonly commandName = 'print';
	readonly description = 'Print text anonymously';
	readonly protected = false;

	async run({ reply, deleteOriginal, args }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { text } = args;

		await deleteOriginal();

		await reply([
			{ description: text }
		]);

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'print',
			args: JSON.stringify({ text }),
		};
	}
}

export default new PrintCommand();
