import { translations, Translation } from '@cquest/db';
import { HeroSBW, HeroForm } from '@cquest/entities';

import {
	heroes, heroKeysDescription, extractResult, localizations
} from '@cquest/data-provider';

import {
	splitText, chunk, getFieldKey
} from '../util';
import {
	CommandCategory, CommandResult, CommandPayload, CommandReply, CommandResultCode, ArgumentType
} from '../common-types';
import {
	EmbedSource, InitialMessageSource, PaginationEmbed, PandoraEmbed
} from '../embeds';

import BaseCommand from './abstract/BaseCommand';

function translationsToEmbeds(ts: Translation[]): EmbedSource[] {
	const embeds: EmbedSource[] = [];

	let i = 0;
	for (const translationsChunk of chunk(ts, 10)) {
		const embed = new PandoraEmbed()
			.setFooter(`Translations ${i * 10 + 1}-${i * 10 + translationsChunk.length}/${ts.length}`);

		for (const translation of translationsChunk) {
			let atFirst = true;

			for (const chuk of splitText(translation.text)) {
				embed.addField(
					atFirst
						? `${heroKeysDescription[translation.key]}, ID: ${translation.id}`
						: '\u200b',
					chuk
				);

				atFirst = false;
			}
		}

		embeds.push(embed.toEmbed());

		i += 1;
	}

	return embeds;
}

type ActionArguments = {
	action: string;
	key: string;
	name: string;
	id: string;
};

type Action = (reply: CommandReply, args: Partial<ActionArguments>, initial: InitialMessageSource) => Promise<void>;

const actions: Record<string, Action> = {
	list: async (reply, { key }, initial) => {
		try {
			const list = translationsToEmbeds(await translations.list(key));

			if (!list.length) {
				await reply('No pending translations!');
				return;
			}

			const embed = new PaginationEmbed({ initial })
				.setArray(list)
				.showPageIndicator(false)
				.send();

			await embed;
		} catch (error) {
			await reply('Unable to list submitted translations. Please, contact bot owner.');

			throw error;
		}
	},
	accept: async (reply, { id }) => {
		try {
			const acceptedTranslation = await translations.accept(id!);

			localizations[acceptedTranslation.locale][acceptedTranslation.key] = acceptedTranslation;

			await reply('Translation accepted!');
		} catch (error) {
			await reply('Unable to accept translation. Please, contact bot owner.');

			throw error;
		}
	},
	decline: async (reply, { id }) => {
		try {
			await translations.decline(id!);

			await reply('Translation declined!');
		} catch (error) {
			await reply('Unable to decline translation. Please, contact bot owner.');

			throw error;
		}
	},
	clear: async (reply, { key }) => {
		try {
			await translations.declineAllUnaccepted(key!);

			await reply('Translation cleared!');
		} catch (error) {
			await reply('Unable to clear translations. Please, contact bot owner.');

			throw error;
		}
	}
};

actions['list-all'] = actions.list;

const cmdArgs = {
	action: ArgumentType.choice({
		required: true,
		choices: Object.keys(actions).reduce((r, v) => ({
			...r,
			[v]: v,
		}), {}),
		description: 'Action to perform.',
	}),
	field: ArgumentType.choice({
		required: false,
		choices: {
			'Block name': 'block-name',
			'Block description': 'block-description',
			'Passive name': 'passive-name',
			'Passive description': 'passive-description',
			Lore: 'lore',
			Name: 'name',
			'SBW name': 'sbw-name',
			'SBW description': 'sbw-ability',
		},
		default: null,
		description: 'Field to translate.',
	}),
	name: ArgumentType.string({
		required: false,
		default: null,
		// TODO autocomplete
		description: 'Hero name',
	}),
	grade: ArgumentType.number({
		required: false,
		description: 'SBW or hero grade',
		default: 6,
	}),
	id: ArgumentType.string({
		required: false,
		description: 'ID of translations to accept or decline',
		default: null,
	}),
};

type Arguments = typeof cmdArgs;

export class ManageTranslationsCommand extends BaseCommand<Arguments> {
	readonly args = cmdArgs;
	readonly argsOrderMatters = true;
	readonly category = CommandCategory.PROTECTED;
	readonly commandName = 'manage-translations';
	readonly description = 'Heroes info translations management';
	readonly protected = true;

	async run({ args, reply, initial }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const {
			action: actionName,
			field,
			name: heroName,
			grade,
			id,
		} = args;

		const action = actions[actionName];

		if (!action) {
			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				target: 'action',
				args: JSON.stringify({
					action: actionName,
					field,
					heroName,
					grade,
					id
				}),
			};
		}

		if (['accept', 'decline', 'list-all'].includes(actionName)) {
			await action(
				reply,
				{
					action: actionName,
					id: field,
				},
				initial,
			);

			return {
				statusCode: CommandResultCode.SUCCESS,
				target: field,
				args: JSON.stringify({
					action: actionName,
					id: field
				}),
			};
		}

		const result = heroes.search(heroName);

		if (!result) {
			await reply('Hero not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const { result: hero } = extractResult(result);

		let form: HeroForm | undefined;
		let sbw: HeroSBW | undefined;
		if (actionName.includes('sbw')) {
			sbw = hero.sbws.find(f => f.star === grade);

			if (!sbw) {
				await reply('Soulbound weapon grade not found!');

				return {
					statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
					target: 'sbw',
				};
			}
		} else {
			form = hero.forms.find(f => f.star === grade);

			if (!form) {
				await reply('Hero grade not found!');

				return {
					statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
					target: 'hero',
				};
			}
		}

		const key = getFieldKey(field, form, sbw);

		if (!key) {
			await reply('Unknown field!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				target: 'field',
			};
		}

		if (['list', 'clear'].includes(actionName)) {
			await action(
				reply,
				{
					action: actionName,
					key
				},
				initial,
			);

			return {
				statusCode: CommandResultCode.SUCCESS,
				target: key,
				args: JSON.stringify({
					action: actionName,
					key
				})
			};
		}

		return {
			statusCode: CommandResultCode.UNKNOWN_ERROR,
		};
	}
}

export default new ManageTranslationsCommand();
