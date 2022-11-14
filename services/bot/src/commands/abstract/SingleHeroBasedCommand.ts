import { HeroForm } from '@cquest/entities';
import { heroes, extractResult } from '@cquest/data-provider';

import BaseCommand from './BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments, ArgumentType
} from '../../common-types';

import {
	HeroBlockEmbed, HeroFormsEmbed, HeroSBWEmbed, HeroSBWBlockEmbed, HeroSkinsEmbed
} from '../../embeds';

import { parseQuery, parseGrade } from '../../util';

const cmdArgs = {
	name: ArgumentType.string({
		required: true,
		description: 'Hero name',
	}),
	star: ArgumentType.number({
		required: false,
		description: 'Optional grade. Defaults to highest possible',
		default: 0,
	}),
};

type HeroBasedEmbeds =
	typeof HeroBlockEmbed | typeof HeroFormsEmbed | typeof HeroSBWEmbed | typeof HeroSBWBlockEmbed |
	typeof HeroSkinsEmbed;

type Arguments = typeof cmdArgs;
export default abstract class SingleHeroBasedCommand extends BaseCommand<Arguments> {
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

	async run({ reply, args }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { star, name } = args;

		const result = heroes.search(name);

		if (!result) {
			await reply('Hero not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const { result: hero, locales } = extractResult(result);

		if (this.checkSBW && !hero.sbws.length) {
			await reply('Soulbound weapon not found for hero!');

			return {
				statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
				target: 'sbw',
				args: JSON.stringify({ name, star }),
			};
		}

		let page = -1;

		if (this.checkGrade) {
			let form: HeroForm | undefined;

			if (star) {
				form = hero.forms.find(f => f.star === star);
			} else {
				form = hero.forms[hero.forms.length - 1];
			}

			if (!form) {
				await reply('Hero grade not found!');

				return {
					statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
				};
			}

			page = hero.forms.indexOf(form) + 1;
		}

		// eslint-disable-next-line new-cap
		const embed = new this.embed({
			// TODO fixme
			initialMessage: {} as any,
			hero,
			page,
			locales,
		});

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: hero.id,
			args: JSON.stringify({ name, star }),
		};
	}
}
