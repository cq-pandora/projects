import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';
import { FishesEmbed } from '../embeds';
import { parseQuery } from '../util';
import { fishes, extractResult } from '../cq-data';

const cmdArgs: CommandArguments = {
	name: {
		required: true,
		description: 'Fish name',
	}
};

export class FishCommand extends BaseCommand {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'fish';
	public readonly description = 'Get fish info';
	public readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) return this.sendUsageInstructions(payload);

		const name = parseQuery(args);
		const { results: candidates, locales } = extractResult(fishes.searchAll(name));

		if (!candidates.length) {
			await message.channel.send('Fish not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				args: JSON.stringify({ name }),
			};
		}

		const embed = new FishesEmbed({
			initialMessage: message,
			fishes: candidates,
			locales,
		});

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: candidates.map(b => b.id).join(','),
			args: JSON.stringify({ name }),
		};
	}
}

export default new FishCommand();
