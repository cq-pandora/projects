import { portraits, extractResult } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';
import { PortraitsEmbed } from '../embeds';

const cmdArgs = {
	name: ArgumentType.string({
		required: true,
		description: 'Name of character',
	}),
};

type Arguments = typeof cmdArgs;
export class PortraitCommand extends BaseCommand<Arguments> {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'portrait';
	public readonly description = 'Get character portrait';
	public readonly protected = false;

	async run({ reply, args }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { name } = args;

		const searchResult = portraits.search(name);

		if (!searchResult) {
			await reply('Portrait not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				args: JSON.stringify({ name }),
			};
		}

		const { result: portrait } = extractResult(searchResult);

		const embed = new PortraitsEmbed({ portraits: portrait.keys });

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: portrait.keys.join(','),
			args: JSON.stringify({ name }),
		};
	}
}

export default new PortraitCommand();
