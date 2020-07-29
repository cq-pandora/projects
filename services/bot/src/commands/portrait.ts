import { portraits, extractResult } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';
import { PortraitsEmbed } from '../embeds';
import { parseQuery } from '../util';

const cmdArgs: CommandArguments = {
	name: {
		required: true,
		description: 'Name of character',
	}
};

export class PortraitCommand extends BaseCommand {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'portrait';
	public readonly description = 'Get character portrait';
	public readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) return this.sendUsageInstructions(payload);

		const name = parseQuery(args);

		const searchResult = portraits.search(name);

		if (!searchResult) {
			await message.channel.send('Portrait not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				args: JSON.stringify({ name }),
			};
		}

		const { result: portrait } = extractResult(searchResult);

		const embed = new PortraitsEmbed({ initialMessage: message, portraits: portrait.keys });

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: portrait.keys.join(','),
			args: JSON.stringify({ name }),
		};
	}
}

export default new PortraitCommand();
