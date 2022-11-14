import { EmbedBuilder } from 'discord.js';

import { evaluate as mathjsEvaluate } from 'mathjs';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments, ArgumentType
} from '../common-types';

const cmdArgs = {
	expression: ArgumentType.string({
		required: true,
		description: 'Expression to evaluate. Visit http://mathjs.org/ for examples',
	}),
};

type Arguemnts = typeof cmdArgs;

export class MathCommand extends BaseCommand<Arguemnts> {
	readonly args = cmdArgs;
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.UTIL;
	readonly commandName = 'math';
	readonly description = 'Evaluate math expression';
	readonly protected = false;

	async run({ args, reply }: CommandPayload<Arguemnts>): Promise<Partial<CommandResult>> {
		const { expression } = args;

		let err = false;
		let result: string;

		try {
			result = mathjsEvaluate(expression).toString();
		} catch (error: any) {
			result = error.toString();
			err = true;
		}

		await reply([
			new EmbedBuilder()
				.setDescription(result)
		]);

		return {
			statusCode: err
				? CommandResultCode.UNKNOWN_ERROR
				: CommandResultCode.SUCCESS,
			target: 'math',
			args: JSON.stringify({ expression }),
		};
	}
}

export default new MathCommand();
