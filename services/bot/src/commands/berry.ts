import { berries, extractResult } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';
import BerriesEmbed from '../embeds/BerriesEmbed';

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

	async run({ reply, args, initial }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { name } = args;
		const { results: candidates } = extractResult(berries.searchAll(name));

		if (!candidates.length) {
			await reply('Berry not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				args: JSON.stringify({ name }),
			};
		}

		// One berry family (same stat) reads best from the smallest to the legendary one
		const entities = candidates.every(b => b.targetStat === candidates[0].targetStat)
			? [...candidates].sort((a, b) => a.grade - b.grade)
			: candidates;

		const embed = new BerriesEmbed({
			initial, entities,
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
