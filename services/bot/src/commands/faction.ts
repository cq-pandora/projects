import { factions, extractResult } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';
import { FactionsEmbed } from '../embeds';

const cmdArgs = {
	name: ArgumentType.string({
		required: true,
		description: 'Faction name',
	}),
};

type Arguments = typeof cmdArgs;

export class FactionCommand extends BaseCommand<Arguments> {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'faction';
	public readonly description = 'Get faction hero list';
	public readonly protected = false;

	async run({ reply, args, initial }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { name } = args;
		const { results: candidates } = extractResult(factions.searchAll(name));

		if (!candidates.length) {
			await reply('Faction not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const embed = new FactionsEmbed({ initial, factions: candidates });

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: candidates.map(f => f.id).join(','),
			args: JSON.stringify({ name }),
		};
	}
}

export default new FactionCommand();
