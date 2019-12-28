import math from 'mathjs';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';

const cmdArgs: CommandArguments = {
	expression: {
		required: true,
		description: 'Expression to evaluate. Visit http://mathjs.org/ for examples',
	}
};

export class MathCommand extends BaseCommand {
	readonly args = cmdArgs;
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.UTIL;
	readonly commandName = 'math';
	readonly description = 'Evaluate math expression';
	readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) return this.sendUsageInstructions(payload);

		const problem = args.join(' ');

		let err = false;
		let result: string;
		try {
			result = math.evaluate(problem).toString();
		} catch (error) {
			result = error.toString();
			err = true;
		}

		await message.channel.send({
			embed: {
				description: result
			},
		});

		return {
			statusCode: err
				? CommandResultCode.UNKNOWN_ERROR
				: CommandResultCode.SUCCESS,
			target: 'math',
			args: JSON.stringify({ problem }),
		};
	}
}

export default new MathCommand();
