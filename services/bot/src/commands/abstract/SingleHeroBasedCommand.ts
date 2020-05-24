import { HeroForm } from '@pandora/entities';

import BaseCommand from './BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../../common-types';

import {
	HeroBlockEmbed, HeroFormsEmbed, HeroSBWEmbed, HeroSBWBlockEmbed, HeroSkinsEmbed
} from '../../embeds';

import { parseQuery, parseGrade } from '../../util';
import { heroes, extractResult } from '../../cq-data';

const cmdArgs: CommandArguments = {
	name: {
		required: true,
		description: 'Hero name',
	},
	star: {
		required: false,
		description: 'Optional grade. Defaults to highest possible',
	}
};

type HeroBasedEmbeds =
	typeof HeroBlockEmbed | typeof HeroFormsEmbed | typeof HeroSBWEmbed | typeof HeroSBWBlockEmbed |
	typeof HeroSkinsEmbed;

export default abstract class SingleHeroBasedCommand extends BaseCommand {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public abstract readonly commandName: string;
	public abstract readonly description: string;
	public readonly protected = false;
	private readonly embed: HeroBasedEmbeds;
	private readonly checkSBW: boolean;
	private readonly checkGrade: boolean;

	protected constructor(embed: HeroBasedEmbeds, checkSBW = false, checkGrade = true) {
		super();
		this.embed = embed;
		this.checkSBW = checkSBW;
		this.checkGrade = checkGrade;
	}

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { args, message } = payload;

		if (!args.length) { return this.sendUsageInstructions(payload); }

		const grade = parseGrade(args);
		const name = parseQuery(args, [`${grade}`]);

		const result = heroes.search(name);

		if (!result) {
			await message.channel.send('Hero not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const { result: hero, locales } = extractResult(result);

		if (this.checkSBW && !hero.sbws.length) {
			await message.channel.send('Soulbound weapon not found for hero!');

			return {
				statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
				target: 'sbw',
				args: JSON.stringify({ name, grade }),
			};
		}

		let page = -1;

		if (this.checkGrade) {
			let form: HeroForm | undefined;

			if (grade) {
				form = hero.forms.find(f => f.star === grade);
			} else {
				form = hero.forms[hero.forms.length - 1];
			}

			if (!form) {
				await message.channel.send('Hero grade not found!');

				return {
					statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
				};
			}

			page = hero.forms.indexOf(form) + 1;
		}

		// eslint-disable-next-line new-cap
		const embed = new this.embed({
			initialMessage: message,
			hero,
			page,
			locales,
		});

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: hero.id,
			args: JSON.stringify({ name, grade }),
		};
	}
}
