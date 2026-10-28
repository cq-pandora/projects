import { Hero, HeroForm } from '@cquest/entities';
import { extractResult } from '@cquest/data-provider';

import BaseCommand from './BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../../common-types';

import {
	HeroBlockEmbed, HeroFormsEmbed, HeroSBWEmbed, HeroSBWBlockEmbed, HeroSkinsEmbed
} from '../../embeds';
import { searchHero } from '../../util';

const cmdArgs = {
	name: ArgumentType.string({
		required: true,
		description: 'Hero name. Add a class or type to tell same-named heroes apart, e.g. "beatrice wizard"',
	}),
	star: ArgumentType.number({
		required: false,
		description: 'Optional grade. Defaults to highest possible',
		default: 0,
	}),
};

type HeroBasedEmbeds =
	typeof HeroBlockEmbed | typeof HeroFormsEmbed | typeof HeroSBWEmbed | typeof HeroSBWBlockEmbed
	| typeof HeroSkinsEmbed;

type Arguments = typeof cmdArgs;
export default abstract class SingleHeroBasedCommand extends BaseCommand<Arguments> {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public abstract readonly commandName: string;
	public abstract readonly description: string;
	public readonly protected = false;
	private readonly embed: HeroBasedEmbeds;
	private readonly checkGrade: boolean;

	protected constructor(embed: HeroBasedEmbeds, checkGrade = true) {
		super();
		this.embed = embed;
		this.checkGrade = checkGrade;
	}

	/** Reply text when the hero lacks what the embed shows (no SBW, no skins, ...), otherwise undefined */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- hook signature for subclasses
	protected missingDataReply(hero: Hero): string | undefined {
		return undefined;
	}

	/** 1-based embed page showing the given form, or undefined when the embed has no page for it */
	protected pageOf(hero: Hero, form: HeroForm): number | undefined {
		return hero.forms.indexOf(form) + 1;
	}

	async run({ reply, args, initial }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { star, name } = args;

		const result = searchHero(name, star);

		if (!result) {
			await reply('Hero not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const { result: hero, locales } = extractResult(result);

		const missingData = this.missingDataReply(hero);

		if (missingData) {
			await reply(missingData);

			return {
				statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
				target: this.commandName,
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

			const formPage = form && this.pageOf(hero, form);

			if (!formPage) {
				await reply('Hero grade not found!');

				return {
					statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
				};
			}

			page = formPage;
		}

		// eslint-disable-next-line new-cap
		const embed = new this.embed({
			initial,
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
