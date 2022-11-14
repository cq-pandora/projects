import { fishes, extractResult } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';
import { FishesEmbed } from '../embeds';

const cmdArgs = {
	name: ArgumentType.string({
		required: true,
		description: 'Fish name',
	}),
};

type Arguments = typeof cmdArgs;

export class FishCommand extends BaseCommand<Arguments> {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'fish';
	public readonly description = 'Get fish info';
	public readonly protected = false;

	async run({ reply, args }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { name } = args;
		const { results: candidates, locales } = extractResult(fishes.searchAll(name));

		if (!candidates.length) {
			await reply('Fish not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				args: JSON.stringify({ name }),
			};
		}

		const embed = new FishesEmbed({
			initialMessage: undefined,
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
