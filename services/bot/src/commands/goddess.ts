import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';
import { GoddessesEmbed } from '../embeds';
import { goddesses } from '../cq-data';

const cmdArgs: CommandArguments = {
	name: {
		required: true,
		description: 'Goddess name',
	},
};

export class GoddessCommand extends BaseCommand {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'goddess';
	public readonly description = 'Get goddess skill information';
	public readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) return this.sendUsageInstructions(payload);

		const name = args.join(' ');

		const candidates = goddesses.searchAll(name);

		if (!candidates.length) {
			await message.channel.send('Goddess not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const embed = new GoddessesEmbed(message, candidates);

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: candidates.map(g => g.id).join(','),
			args: JSON.stringify({ input: args.join(' ') }),
		};
	}
}

export default new GoddessCommand();
