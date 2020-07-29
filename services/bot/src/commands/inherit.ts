import { InheritanceLevel } from '@cquest/entities';
import { heroes, extractResult } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';
import { parseQuery, parseInheritance } from '../util';
import { HeroInheritanceEmbed } from '../embeds';

const cmdArgs: CommandArguments = {
	name: {
		required: true,
		description: 'Hero name',
	},
	inheritance: {
		required: false,
		description: 'Get specific inheritance level stats',
	}
};

export class InheritCommand extends BaseCommand {
	readonly args = cmdArgs;
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.DB;
	readonly commandName = 'inherit';
	readonly description = 'Get hero inheritance stats for different levels or MAX Berried if level is 0';
	readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) return this.sendUsageInstructions(payload);

		const iLvl = parseInheritance(args);
		const name = parseQuery(args, [iLvl]);

		const searchResult = heroes.search(name);

		if (!searchResult) {
			await message.channel.send('Hero not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const { result: hero, locales } = extractResult(searchResult);

		const form = hero.forms.find(f => f.star === 6);

		if (!form) {
			await message.channel.send('Hero cannot be inherited!');

			return {
				statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
			};
		}

		const levels = (iLvl || iLvl === 0)
			? [iLvl]
			: [0, 5, 10, 15, 20, 25, 30] as InheritanceLevel[];

		const embed = new HeroInheritanceEmbed({
			initialMessage: message,
			hero,
			inherits: levels,
			locales,
		});

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: hero.id,
			args: JSON.stringify({ name, inheritance: iLvl }),
		};
	}
}

export default new InheritCommand();
