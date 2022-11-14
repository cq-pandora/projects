import { berries, extractResult } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';
import BerriesListEmbed from '../embeds/BerriesEmbed';

const cmdArgs = {
	name: ArgumentType.string({
		required: true,
		description: 'Berry name',
	}),
};

type Arguments = typeof cmdArgs;

class BerryCommand extends BaseCommand<Arguments> {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'berry';
	public readonly description = 'Get berry info';
	public readonly protected = false;

	async run({ reply, args }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { name } = args;
		const { results: candidates, locales } = extractResult(berries.searchAll(name));

		if (!candidates.length) {
			await reply('Berry not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				args: JSON.stringify({ name }),
			};
		}

		const embed = new BerriesListEmbed({
			initialMessage: undefined,
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
