import { js_beautify as beautify } from 'js-beautify';
import { inspect } from 'util';
import { Script, createContext } from 'vm';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';

const cmdArgs: CommandArguments = {
	script: {
		required: true,
		description: 'JS code to evaluate',
	},
};

export class EvalCommand extends BaseCommand {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.PROTECTED;
	public readonly commandName = 'eval';
	public readonly description = 'Execute some JavaScript code';
	public readonly protected = true;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) return this.sendUsageInstructions(payload);

		let input = args.join(' ');

		input = beautify(input, {
			// This is how library works
			// eslint-disable-next-line @typescript-eslint/camelcase
			indent_size: 2
		});

		let output: string;
		let err = false;

		try {
			const sandbox = new Script(input);
			const context = createContext(
				{},
				{
					name: 'Eval',
					codeGeneration: {
						strings: false,
						wasm: false
					}
				}
			);

			output = await sandbox.runInContext(context);
			output = inspect(output, {
				colors: false,
				compact: false,
				maxArrayLength: 30
			});
		} catch (error) {
			err = true;

			output = String(error);
		}

		await message.channel.send({
			embed: {
				fields: [
					{
						name: 'Input',
						value: `\`\`\`js\n${input}\`\`\``
					},
					{
						name: 'Output',
						value: `\`\`\`js\n${output}\`\`\``
					}
				]
			}
		});

		return {
			statusCode: err
				? CommandResultCode.UNKNOWN_ERROR
				: CommandResultCode.SUCCESS,
			target: 'script',
			args: JSON.stringify({ input: args.join(' ') }),
		};
	}
}

export default new EvalCommand();
