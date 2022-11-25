import { bosses, extractResult } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';
import { BossesEmbed } from '../embeds';

const cmdArgs = {
	name: ArgumentType.string({
		required: true,
		description: 'Boss name',
	}),
};

type Arguments = typeof cmdArgs;

export class BossCommand extends BaseCommand<Arguments> {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'boss';
	public readonly description = 'Get boss stats';
	public readonly protected = false;

	async run({ reply, args, initial }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { name } = args;
		const { results: entities } = extractResult(bosses.searchAll(name));

		if (!entities.length) {
			await reply('Boss not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const embed = new BossesEmbed({
			initial, bosses: entities,
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
