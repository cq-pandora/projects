import { HeroSBW, HeroForm } from '@pandora/entities';
import { Message } from 'discord.js';

import { LocalizableMessageEmbed } from '../embeds/LocalizableMessageEmbed';
import {
	splitText, chunk, parseGrade, getFieldKey
} from '../util';
import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';
import * as translations from '../db/translations';
import { Translation } from '../db/models';
import { PaginationEmbed } from '../embeds';
import { heroes, heroKeysDescription, extractResult } from '../cq-data';

import BaseCommand from './abstract/BaseCommand';

function translationsToEmbeds(ts: Translation[]): LocalizableMessageEmbed[] {
	const embeds: LocalizableMessageEmbed[] = [];

	let i = 0;
	for (const translationsChunk of chunk(ts, 10)) {
		const embed = new LocalizableMessageEmbed()
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

		embeds.push(embed);

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

type Action = (message: Message, args: Partial<ActionArguments>) => Promise<void>;

const actions: Record<string, Action> = {
	list: async (message, { key }) => {
		try {
			const list = translationsToEmbeds(await translations.list(key));

			if (!list.length) {
				await message.channel.send('No pending translations!');
				return;
			}

			const embed = new PaginationEmbed({ initialMessage: message })
				.setArray(list)
				.setChannel(message.channel)
				.showPageIndicator(false)
				.send();

			await embed;
		} catch (error) {
			await message.channel.send('Unable to list submitted translations. Please, contact bot owner.');

			throw error;
		}
	},
	accept: async (message, { id }) => {
		try {
			await translations.accept(id!);

			await message.channel.send('Translation accepted!');
		} catch (error) {
			await message.channel.send('Unable to accept translation. Please, contact bot owner.');

			throw error;
		}
	},
	decline: async (message, { id }) => {
		try {
			await translations.decline(id!);

			await message.channel.send('Translation declined!');
		} catch (error) {
			await message.channel.send('Unable to decline translation. Please, contact bot owner.');

			throw error;
		}
	},
	clear: async (message, { key }) => {
		try {
			await translations.declineAllUnaccepted(key!);

			await message.channel.send('Translation cleared!');
		} catch (error) {
			await message.channel.send('Unable to clear translations. Please, contact bot owner.');

			throw error;
		}
	}
};

actions['list-all'] = actions.list;


const cmdArgs: CommandArguments = {
	action: {
		required: true,
		description: `Action to perform.\nCan be one of ${Object.keys(actions).join(', ')}`,
	},
	field: {
		required: false,
		description: 'Field to translate.\nCan be block-name, block-description, passive-name, passive-description, lore, name, sbw-name or sbw-ability',
	},
	name: {
		required: false,
		description: 'Hero name.\n**Important**: this should be single word, so test if bot can find what you want to translate by that word',
	},
	grade: {
		required: false,
		description: 'SBW or hero grade',
	},
	id: {
		required: false,
		description: 'ID of translations to accept or decline',
	}
};

export class ManageTranslationsCommand extends BaseCommand {
	readonly args = cmdArgs;
	readonly argsOrderMatters = true;
	readonly category = CommandCategory.PROTECTED;
	readonly commandName = 'manage-translations';
	readonly description = 'Heroes info translations management';
	readonly protected = true;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) this.sendUsageInstructions(payload);

		const [actionNameRaw, field, heroName, gradeStr, id] = args;

		const actionName = actionNameRaw.toLowerCase();
		const grade = parseGrade([gradeStr]);
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
			await action(message, {
				action: actionName,
				id: field,
			});

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
			await message.channel.send('Hero not found!');

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
				await message.channel.send('Soulbound weapon grade not found!');

				return {
					statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
					target: 'sbw',
				};
			}
		} else {
			form = hero.forms.find(f => f.star === grade);

			if (!form) {
				await message.channel.send('Hero grade not found!');

				return {
					statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
					target: 'hero',
				};
			}
		}

		const key = getFieldKey(field, form, sbw);

		if (!key) {
			await message.channel.send('Unknown field!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				target: 'field',
			};
		}

		if (['list', 'clear'].includes(actionName)) {
			await action(message, {
				action: actionName,
				key
			});

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
