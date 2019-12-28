import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';
import { SigilsEmbed } from '../embeds';
import { parseQuery } from '../util';
import { sigils } from '../cq-data';

const cmdArgs: CommandArguments = {
	name: {
		required: true,
		description: 'Sigil name',
	}
};

export class SigilCommand extends BaseCommand {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'sigil';
	public readonly description = 'Get sigil info';
	public readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) return this.sendUsageInstructions(payload);

		const name = parseQuery(args);
		const candidates = sigils.searchAll(name);

		if (!candidates.length) {
			await message.channel.send('Sigil not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				args: JSON.stringify({ name }),
			};
		}

		const embed = new SigilsEmbed(message, candidates);

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: candidates.map(b => b.id).join(','),
			args: JSON.stringify({ name }),
		};
	}
}

export default new SigilCommand();
