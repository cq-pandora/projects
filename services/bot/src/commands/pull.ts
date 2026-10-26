import { AttachmentBuilder, EmbedBuilder } from 'discord.js';

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

const brskPool: RollChances = {
	CHA_WA_LIMITED_BRSK_4_01: 1,
	CHA_WA_LIMITED_BRSK_4_02: 1,
	CHA_WI_LIMITED_BRSK_4_03: 2,
	CHA_WA_LIMITED_BRSK_4_04: 2,
	CHA_PA_LIMITED_BRSK_4_05: 2,
	CHA_PR_LIMITED_BRSK_4_06: 2,
	CHA_AR_LIMITED_BRSK_4_07: 2,
	CHA_HU_LIMITED_BRSK_4_08: 2,
};

// Banner rates below are not published by the game, so every hero has the same chance
const uniformPool = (formIds: string[]): RollChances => Object.fromEntries(formIds.map(id => [id, 1]));

const kof1Pool = uniformPool([
	'CHA_PA_LIMITED_KOF1_4_BILLY',
	'CHA_WI_LIMITED_KOF1_4_CHIZURU',
	'CHA_WA_LIMITED_KOF1_4_IORI',
	'CHA_WA_LIMITED_KOF1_4_KYO',
	'CHA_HU_LIMITED_KOF1_4_LEONA',
	'CHA_WA_LIMITED_KOF1_4_RUGAL',
	'CHA_PR_LIMITED_KOF1_4_KENSOU',
]);

const kof2Pool = uniformPool([
	'CHA_PR_LIMITED_KOF2_4_ATHENA',
	'CHA_WA_LIMITED_KOF2_4_CHRIS',
	'CHA_PA_LIMITED_KOF2_4_KIM',
	'CHA_AR_LIMITED_KOF2_4_MAI',
	'CHA_WI_LIMITED_KOF2_4_SHERMIE',
	'CHA_PA_LIMITED_KOF2_4_TERRY',
]);

const ys8Pool = uniformPool([
	'CHA_WA_LIMITED_YS8_4_ADOL',
	'CHA_WA_LIMITED_YS8_4_DANA',
	'CHA_HU_LIMITED_YS8_4_HUMMEL',
	'CHA_WA_LIMITED_YS8_4_LAXIA',
	'CHA_PA_LIMITED_YS8_4_RICOTTA',
	'CHA_PA_LIMITED_YS8_4_SAHAD',
]);

const rwbyPool = uniformPool([
	'CHA_WA_LIMITED_RB_4_BLAKE',
	'CHA_HU_LIMITED_RB_4_NORA',
	'CHA_PA_LIMITED_RB_4_PYRRHA',
	'CHA_HU_LIMITED_RB_4_RUBY',
	'CHA_WA_LIMITED_RB_4_WEISS',
	'CHA_PA_LIMITED_RB_4_YANG',
	'CHA_AR_LIMITED_RB2_4_01',
	'CHA_WA_LIMITED_RB2_4_02',
]);

const octopathPool = uniformPool([
	'CHA_PR_LIMITED_OT_4_01',
	'CHA_WI_LIMITED_OT_4_02',
	'CHA_HU_LIMITED_OT_4_03',
	'CHA_WA_LIMITED_OT_4_04',
	'CHA_AR_LIMITED_OT_4_05',
	'CHA_PA_LIMITED_OT_4_06',
	'CHA_WA_LIMITED_OT_4_07',
	'CHA_AR_LIMITED_OT_4_08',
]);

const etoRangersPool = uniformPool([
	'CHA_WA_LIMITED_ER_4_01',
	'CHA_PA_LIMITED_ER_4_02',
	'CHA_PA_LIMITED_ER_4_03',
	'CHA_PR_LIMITED_ER_4_04',
	'CHA_WI_LIMITED_ER_4_05',
	'CHA_PR_LIMITED_ER_4_06',
	'CHA_AR_LIMITED_ER_4_07',
	'CHA_PR_LIMITED_ER_4_08',
	'CHA_PA_LIMITED_ER_4_09',
	'CHA_PA_LIMITED_ER_4_10',
	'CHA_WA_LIMITED_ER_4_11',
	'CHA_PA_LIMITED_ER_4_12',
	'CHA_WI_LIMITED_ER_4_21',
]);

const ggStrivePool = uniformPool([
	'CHA_PA_LIMITED_GG4_4_01',
	'CHA_WA_LIMITED_GG4_4_02',
	'CHA_WA_LIMITED_GG4_4_03',
]);

const deemoPool = uniformPool([
	'CHA_PR_LIMITED_4_DM2',
	'CHA_WI_LIMITED_4_DEEMO',
]);

const HEROES_HIDDEN = [
	'legendary',
	'support',
	// 'secret'
];

type Puller = (count: number) => HeroForm[];

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for the commented-out "unknown pull type" reply
const PullValues = stringTuple(
	'gg1', 'gg2', 'rz', 'sh', 'contract', 'gs', 'brsk', 'kof1', 'kof2', 'ys8', 'rwby', 'ot', 'er', 'ggst', 'deemo'
);

type PullType = typeof PullValues[number];

const cmdArgs = {
	type: ArgumentType.choice({
		required: false,
		description: 'Pull type',
		default: 'contract',
		choices: {
			Contract: 'contract',
			'Guilty Gear 1': 'gg1',
			'Guilty Gear 2': 'gg2',
			ReZero: 'rz',
			'Shield Hero': 'sh',
			'Goblin Slayer': 'gs',
			Berserk: 'brsk',
			'King of Fighters 1': 'kof1',
			'King of Fighters 2': 'kof2',
			'Ys VIII': 'ys8',
			RWBY: 'rwby',
			'Octopath Traveler': 'ot',
			'Eto Rangers': 'er',
			'Guilty Gear -Strive-': 'ggst',
			'DEEMO II': 'deemo',
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
			brsk: count => ggPull(count, brskPool),
			kof1: count => ggPull(count, kof1Pool),
			kof2: count => ggPull(count, kof2Pool),
			ys8: count => ggPull(count, ys8Pool),
			rwby: count => ggPull(count, rwbyPool),
			ot: count => ggPull(count, octopathPool),
			er: count => ggPull(count, etoRangersPool),
			ggst: count => ggPull(count, ggStrivePool),
			deemo: count => ggPull(count, deemoPool),
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

		await reply({
			embeds: [embed],
			files: [
				new AttachmentBuilder(await canvas.getBuffer('image/png'), { name: 'pull.png' })
			]
		});

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'pull',
			args: JSON.stringify(args),
		};
	}
}

export default new PullCommand();
