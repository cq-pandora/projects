import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';
import { BossesEmbed } from '../embeds';
import { parseQuery } from '../util';
import { bosses, extractResult } from '../cq-data';

const cmdArgs: CommandArguments = {
	name: {
		required: true,
		description: 'Boss name',
	}
};

export class BossCommand extends BaseCommand {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'boss';
	public readonly description = 'Get boss stats';
	public readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) return this.sendUsageInstructions(payload);

		const name = parseQuery(args);

		const { results: entities, locales } = extractResult(bosses.searchAll(name));

		if (!entities.length) {
			await message.channel.send('Boss not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const embed = new BossesEmbed({
			initialMessage: message,
			bosses: entities,
			locales,
		});

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: entities.map(b => b.id).join(','),
			args: JSON.stringify({ name }),
		};
	}
}

export default new BossCommand();
