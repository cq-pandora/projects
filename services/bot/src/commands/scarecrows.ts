import { CommandResultCode, Scarecrow } from '@cquest/entities';
import {
	scarecrows, extractResult, locales as allLocales, Locale
} from '@cquest/data-provider';

import {
	CommandArguments, CommandCategory, CommandPayload, CommandResult
} from '../common-types';
import { ScarecrowsEmbed } from '../embeds';

import BaseCommand from './abstract/BaseCommand';

const cmdArgs: CommandArguments = {
	name: {
		required: false,
		description: 'Scarecrow name. If empty, all scarecrows will be shown',
	},
};

export class ScarecrowsCommand extends BaseCommand {
	public readonly args: CommandArguments = cmdArgs;
	public readonly argsOrderMatters: boolean = false;
	public readonly category: CommandCategory = CommandCategory.DB;
	public readonly commandName: string = 'scarecrow';
	public readonly description: string = 'Get scarecrow stats and info';
	public readonly protected: boolean = false;

	public async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		let entities: Scarecrow[];
		let locales: Locale[];

		if (args.length) {
			const { results, locales: resultLocales } = extractResult(scarecrows.searchAll(args.join(' ')));

			if (!results.length) {
				await message.channel.send('Scarecrow not found!');

				return {
					statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				};
			}

			entities = results;
			locales = resultLocales;
		} else {
			entities = scarecrows.list();
			locales = allLocales;
		}

		const embed = new ScarecrowsEmbed({
			locales: locales.sort((a, b) => {
				if (a === 'en_us') return -1;

				if (b === 'en_us') return 1;

				return 0;
			}),
			initialMessage: message,
			scarecrows: entities,
		});

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: entities.map(g => g.id).join(','),
			args: JSON.stringify({ input: args.join(' ') }),
		};
	}
}

export default new ScarecrowsCommand();
