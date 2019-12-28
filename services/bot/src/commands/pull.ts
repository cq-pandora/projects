import { MessageAttachment, MessageEmbed } from 'discord.js';
import { HeroForm } from '@pandora/entities';

import {
	random, makeInRange, makePullImage, pickGrade, formatPullChunks, chancesRoll,
} from '../util/functions';

import { heroes } from '../cq-data';

import BaseCommand from './abstract/BaseCommand';
import {
	CommandArguments, CommandCategory, CommandPayload, CommandResult, CommandResultCode, RollChances
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

type Puller = (count: number) => HeroForm[];

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

const pulls: Record<string, Puller> = {
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

const cmdArgs: CommandArguments = {
	type: {
		required: false,
		description: `Pull type. Can be one of  ${Object.keys(pulls).join(', ')}`,
	},
	count: {
		required: false,
		description: 'Contracts to pull. Defaults to 10 and capped at 20',
	}
};

export class PullCommand extends BaseCommand {
	readonly args = cmdArgs;
	readonly argsOrderMatters = true;
	readonly category = CommandCategory.MISC;
	readonly commandName = 'pull';
	readonly description = 'Simulate ingame contracts pull';
	readonly protected = false;

	async run({ message, args: [rawType, rawCount] }: CommandPayload): Promise<Partial<CommandResult>> {
		let pullType: string;
		let pullCountString: string;

		if (typeof rawType === 'undefined' || !Number.isNaN(Number(rawType))) {
			pullCountString = rawType;
			pullType = 'contract';
		} else {
			pullCountString = rawCount;
			pullType = rawType;
		}

		const puller = pulls[pullType];

		if (!puller) {
			await message.channel.send(`Unknown pull type. Can be ${Object.getOwnPropertyNames(pulls).join(', ')}!`);
			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				target: 'pull',
				args: JSON.stringify({ pullType, pullCount: pullCountString }),
			};
		}

		const pullCount = makeInRange((Number(pullCountString) || 10), 1, 20);

		const pull = puller(pullCount);

		const canvas = await makePullImage(pull);

		const chunks = formatPullChunks(pull);

		const embed = new MessageEmbed()
			.setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.avatarURL() || undefined)
			.setImage('attachment://pull.png');

		for (const chunk of chunks) {
			embed.addField('\u200b', chunk.join('\n'));
		}

		await message.channel.send({
			embed,
			files: [
				new MessageAttachment(await canvas.getBufferAsync('image/png'), 'pull.png')
			]
		});

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'pull',
			args: JSON.stringify({ pullType, pullCount }),
		};
	}
}

export default new PullCommand();
