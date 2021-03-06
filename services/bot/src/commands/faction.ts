import { factions, extractResult } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';
import { FactionsEmbed } from '../embeds';

const cmdArgs: CommandArguments = {
	name: {
		required: true,
		description: 'Faction name',
	}
};

export class FactionCommand extends BaseCommand {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'faction';
	public readonly description = 'Get faction hero list';
	public readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) return this.sendUsageInstructions(payload);

		const name = args.join(' ');

		const { results: candidates, locales } = extractResult(factions.searchAll(name));

		if (!candidates.length) {
			await message.channel.send('Faction not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const embed = new FactionsEmbed({ initialMessage: message, factions: candidates, locales });

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: candidates.map(f => f.id).join(','),
			args: JSON.stringify({ name }),
		};
	}
}

export default new FactionCommand();
