import { HeroForm, HeroSBW } from '@cquest/entities';
import { translations } from '@cquest/db';
import { heroes, extractResult } from '@cquest/data-provider';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';
import { getFieldKey } from '../util';
import config from '../config';

import BaseCommand from './abstract/BaseCommand';

const cmdArgs: CommandArguments = {
	field: {
		required: true,
		description: 'Field to translate.\nCan be block-name, block-description, passive-name, passive-description, lore, name, sbw-name or sbw-ability',
	},
	name: {
		required: true,
		description: 'Hero name.\n**Important**: this should be single word, so test if bot can find what you want to translate by that word',
	},
	grade: {
		required: true,
		description: 'Hero or SBW grade',
	},
	translation: {
		required: true,
		description: 'Full translation text'
	}
};

export class TranslateCommand extends BaseCommand {
	readonly args = cmdArgs;
	readonly argsOrderMatters = true;
	readonly category = CommandCategory.UTIL;
	readonly commandName = 'translate';
	readonly description = 'Submit translation request for hero or SBW field';
	readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (args.length < 4) return this.sendUsageInstructions(payload);

		const [field, name, gradeStr, ...rest] = args;
		const grade = Number(gradeStr);

		const result = heroes.search(name);

		if (!result) {
			await message.channel.send('Hero not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const { result: hero } = extractResult(result);

		let form: HeroForm | undefined;
		let sbw: HeroSBW | undefined;
		if (field.includes('sbw')) {
			sbw = hero.sbws.find(f => f.star === grade);

			if (!sbw) {
				await message.channel.send('Soulbound weapon grade not found!');

				return {
					statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
					target: hero.id,
				};
			}
		} else {
			form = hero.forms.find(f => f.star === grade);

			if (!form) {
				await message.channel.send('Hero grade not found!');

				return {
					statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
					target: hero.id,
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

		const text = rest.filter(Boolean).join(' ');

		try {
			await translations.submit(key, text, config.gameVersion);

			await message.channel.send('Translation request submitted!\nThanks for trying to make translations clearer');
		} catch (error) {
			await message.channel.send('Unable to submit your translation. Please, contact bot owner.');

			throw error;
		}

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: form ? form.id : sbw ? sbw.id : 'unknown',
			args: JSON.stringify({
				field, name, grade, text
			}),
		};
	}
}

export default new TranslateCommand();
