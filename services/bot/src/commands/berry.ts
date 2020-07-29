import { berries, extractResult } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';
import BerriesListEmbed from '../embeds/BerriesEmbed';
import { parseQuery } from '../util';

const cmdArgs: CommandArguments = {
	name: {
		required: true,
		description: 'Berry name',
	}
};

class BerryCommand extends BaseCommand {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'berry';
	public readonly description = 'Get berry info';
	public readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) return this.sendUsageInstructions(payload);

		const name = parseQuery(args);
		const { results: candidates, locales } = extractResult(berries.searchAll(name));

		if (!candidates.length) {
			await message.channel.send('Berry not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				args: JSON.stringify({ name }),
			};
		}

		const embed = new BerriesListEmbed({
			initialMessage: message,
			entities: candidates,
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

export default new BerryCommand();
