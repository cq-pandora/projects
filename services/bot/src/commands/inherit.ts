import { InheritanceLevel } from '@cquest/entities';
import { extractResult, inheritance as inheritanceStats } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';
import { HeroInheritanceEmbed } from '../embeds';
import { searchHero } from '../util';

const cmdArgs = {
	name: ArgumentType.string({
		required: true,
		description: 'Hero name. Add a class or type to tell same-named heroes apart, e.g. "beatrice wizard"',
	}),
	inheritance: ArgumentType.number({
		required: false,
		description: 'Get specific inheritance level stats',
		default: 0,
	}),
};

type Arguments = typeof cmdArgs;

export class InheritCommand extends BaseCommand<Arguments> {
	readonly args = cmdArgs;
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.DB;
	readonly commandName = 'inherit';
	readonly description = 'Get hero inheritance stats for different levels or MAX Berried if level is 0';
	readonly protected = false;
	readonly aliases = ['i'];

	async run({ reply, args, initial }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { name, inheritance } = args;

		const searchResult = searchHero(name, 6);

		if (!searchResult) {
			await reply('Hero not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const { result: hero } = extractResult(searchResult);

		const form = hero.forms.find(f => f.star === 6);

		if (!form) {
			await reply('Hero cannot be inherited!');

			return {
				statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
			};
		}

		const maxLevel = Object.keys(inheritanceStats[hero.clazz]).length;

		if (!Number.isInteger(inheritance) || inheritance < 0 || inheritance > maxLevel) {
			await reply(`Inheritance level must be a whole number from 0 to ${maxLevel}!`);

			return {
				statusCode: CommandResultCode.SUBENTITY_NOT_FOUND,
				args: JSON.stringify({ name, inheritance }),
			};
		}

		const levels = (
			(inheritance !== 0)
				? [inheritance]
				: [0, 5, 10, 15, 20, 25, 30, 35, 40].filter(level => level <= maxLevel)
		) as InheritanceLevel[];

		const embed = new HeroInheritanceEmbed({
			initial,
			hero,
			inherits: levels,
		});

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: hero.id,
			args: JSON.stringify({ name, inheritance }),
		};
	}
}

export default new InheritCommand();
