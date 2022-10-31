import { EmbedBuilder } from 'discord.js';

import { HeroForm } from '@cquest/entities';
import { heroes } from '@cquest/data-provider';

import {
	random, makeInRange, makePullImage, pickGrade, formatPullChunks, chancesRoll, stringTuple
} from '../util/functions';

import BaseCommand from './abstract/BaseCommand';
import {
	CommandCategory, CommandPayload, CommandResult, CommandResultCode, RollChances, ArgumentType
} from '../common-types';

const reZeroPool: RollChances = {
	CHA_WI_LIMITED_RZ_4_05: 1,
	CHA_PA_LIMITED_RZ_4_03: 1,
	CHA_PR_LIMITED_RZ_4_07: 3,
	CHA_WA_LIMITED_RZ_4_02: 3,
	CHA_WI_LIMITED_RZ_4_04: 3,
	CHA_WI_LIMITED_RZ_4_06: 3,
};

const gg1Pool: RollChances = {
	CHA_WI_LIMITED_GG_4_1: 1,
	CHA_WA_LIMITED_GG_4_2: 1,
	CHA_HU_LIMITED_GG_4_1: 3,
	CHA_PR_LIMITED_GG_4_1: 3,
	CHA_WA_LIMITED_GG_4_1: 3,
	CHA_PA_LIMITED_GG_4_1: 3,
	CHA_AR_LIMITED_GG_4_1: 3,
};

const gg2Pool: RollChances = {
	CHA_WI_LIMITED_GG3_4_DIZZY: 1,
	CHA_WA_LIMITED_GG_4_4: 1,
	CHA_WA_LIMITED_GG3_4_BAIKEN: 3,
	CHA_WA_LIMITED_GG_4_3: 3,
	CHA_PA_LIMITED_GG_4_2: 3,
	CHA_WI_LIMITED_GG_4_2: 3,
};

const gsPool: RollChances = {
	CHA_PA_LIMITED_GS_4_02: 10,
	CHA_WA_LIMITED_GS_4_01: 10,
	CHA_AR_LIMITED_GS_4_06: 24,
	CHA_PR_LIMITED_GS_4_03: 24,
	CHA_PR_LIMITED_GS_4_04: 24,
	CHA_WA_LIMITED_GS_4_07: 24,
	CHA_WI_LIMITED_GS_4_05: 24,
};

const shPool: RollChances = {
	CHA_PA_LIMITED_SH_4_02: 1,
	CHA_PA_LIMITED_SH_4_03: 3,
	CHA_WA_LIMITED_SH_4_01: 1,
	CHA_WI_LIMITED_SH_4_04: 3,
	CHA_WI_LIMITED_SH_4_05: 3,
	CHA_WI_LIMITED_SH_4_06: 3,
};

const HEROES_HIDDEN = [
	'legendary',
	'support',
	// 'secret'
];

type Puller = (count: number) => HeroForm[];

const PullValues = stringTuple('gg1', 'gg2', 'rz', 'sh', 'contract', 'gs');

type PullType = typeof PullValues[number];

const cmdArgs = {
	type: ArgumentType.choice({
		required: false,
		description: `Pull type. Can be one of  ${PullValues.join(', ')}`,
		default: 'contract',
		choices: {
			Contract: 'contract',
			'Guilty Gear 1': 'gg1',
			'Guilty Gear 2': 'gg2',
			ReZero: 'rz',
			'Shield Hero': 'sh',
			'Goblin Slayer': 'gs',
		},
	}),
	count: ArgumentType.number({
		required: false,
		description: 'Contracts to pull. Defaults to 10 and capped at 20',
		default: 10,
	}),
};

type Arguments = typeof cmdArgs;

// FIXME pull translations

export class PullCommand extends BaseCommand<Arguments> {
	readonly args = cmdArgs;
	readonly argsOrderMatters = true;
	readonly category = CommandCategory.MISC;
	readonly commandName = 'pull';
	readonly description = 'Simulate ingame contracts pull';
	readonly protected = false;

	private pulls?: Record<PullType, Puller>;

	private initPulls(): void {
		const forms = heroes
			.list()
			.filter(hero => hero.type && !HEROES_HIDDEN.includes(hero.type))
			.map(hero => (
				hero.forms.map((form) => {
					form.hero = hero;

					return form;
				})
			))
			.flat();

		const secretForms = forms.filter(f => f.hero.type === 'secret' || f.hero.type === 'collab');
		const plainForms = forms.filter(f => f.hero.type !== 'secret' && f.hero.type !== 'collab');

		const secretFormsById = secretForms.reduce(
			(r, t) => { r[t.id] = t; return r; },
			{} as Record<string, HeroForm>
		);

		const sortedForms: Record<number | 'guaranteed', HeroForm[]> = {
			guaranteed: [],
		};

		for (const key of [3, 4, 5, 6]) {
			sortedForms[key] = plainForms.filter(form => (
				Number(form.star) === key
			));
		}
		sortedForms.guaranteed = sortedForms[4].filter(f => f.hero.type === 'contract');

		const ggPull = (count: number, chances: RollChances): HeroForm[] => Array.from({ length: count })
			.map((_, idx) => {
				if ((1 + idx) % 10) {
					const grade = pickGrade({ 4: 0.17 }, 3);

					if (grade === 3) {
						return sortedForms[3][random(0, sortedForms[3].length - 1)];
					}

					const form = chancesRoll(chances);

					return secretFormsById[form];
				}

				const form = chancesRoll(chances);

				return secretFormsById[form];
			});

		this.pulls = {
			gg1: count => ggPull(count, gg1Pool),
			gg2: count => ggPull(count, gg2Pool),
			rz: count => ggPull(count, reZeroPool),
			sh: count => ggPull(count, shPool),
			contract: count => Array.from({ length: count })
				.map((_, idx) => {
					if ((1 + idx) % 10) {
						const grade = pickGrade();

						return sortedForms[grade][random(0, sortedForms[grade].length - 1)];
					}
					return sortedForms.guaranteed[random(0, sortedForms.guaranteed.length - 1)];
				}),
			gs: count => ggPull(count, gsPool),
		};
	}

	async run({ reply, args, author }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { count, type } = args;

		if (this.pulls === undefined) {
			this.initPulls();
		}

		// if (!(pullType in this.pulls!)) {
		// await reply(`Unknown pull type. Can be ${PullValues.join(', ')}!`);
		// return {
		// statusCode: CommandResultCode.ENTITY_NOT_FOUND,
		// target: 'pull',
		// args: JSON.stringify({ pullType, pullCount: pullCountString }),
		//  };
		// }

		const pullCount = makeInRange(count, 1, 20);

		const pull = this.pulls![type as PullType](pullCount);

		const canvas = await makePullImage(pull);

		const chunks = formatPullChunks(pull);

		const embed = new EmbedBuilder()
			.setAuthor({
				name: `${author.username}#${author.tag}`,
				iconURL: author.avatarURL() || undefined,
			})
			.setImage('attachment://pull.png')
			.addFields(
				chunks.map(chunk => ({ name: '\u200b', value: chunk.join('\n') }))
			);

		// FIXME another raw reply

		// await reply({
		// embeds: [embed],
		// files: [
		// new AttachmentBuilder(await canvas.getBufferAsync('image/png'), { name: 'pull.png' })
		// ]
		// });

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'pull',
			args: JSON.stringify(args),
		};
	}
}

export default new PullCommand();
