import { goddesses, extractResult } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';
import { GoddessesEmbed } from '../embeds';

const cmdArgs = {
	name: ArgumentType.string({
		required: true,
		description: 'Goddess name',
	}),
};

type Arguments = typeof cmdArgs;

export class GoddessCommand extends BaseCommand<Arguments> {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'goddess';
	public readonly description = 'Get goddess skill information';
	public readonly protected = false;

	async run({ reply, args, initial }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { results: candidates } = extractResult(goddesses.searchAll(args.name));

		if (!candidates.length) {
			await reply('Goddess not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const embed = new GoddessesEmbed({
			initial,
			goddesses: candidates,
		});

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: candidates.map(g => g.id).join(','),
			args: JSON.stringify(args),
		};
	}
}

export default new GoddessCommand();
