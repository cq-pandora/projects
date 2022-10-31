import { sigils, extractResult } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType,
} from '../common-types';
import { SigilsEmbed } from '../embeds';

const cmdArgs = {
	name: ArgumentType.string({
		required: true,
		description: 'Sigil name',
	}),
};

type Arguments = typeof cmdArgs;

export class SigilCommand extends BaseCommand<Arguments> {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'sigil';
	public readonly description = 'Get sigil info';
	public readonly protected = false;

	async run(payload: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { args, reply } = payload;

		const { name } = args;
		const { results: candidates, locales } = extractResult(sigils.searchAll(name));

		if (!candidates.length) {
			await reply('Sigil not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				args: JSON.stringify({ name }),
			};
		}

		const embed = new SigilsEmbed({
			sigs: candidates,
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

export default new SigilCommand();
