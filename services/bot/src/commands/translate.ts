import { HeroForm, HeroSBW } from '@cquest/entities';
import { translations } from '@cquest/db';
import { heroes, extractResult } from '@cquest/data-provider';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';
import { getFieldKey } from '../util';
import config from '../config';

import BaseCommand from './abstract/BaseCommand';

const cmdArgs = {
	field: ArgumentType.string({
		required: true,
		// TODO migrate to choices
		// description: 'Field to translate.\nCan be block-name,
		// block-description, passive-name, passive-description, lore, name, sbw-name or sbw-ability',
		description: 'Field to translate',
	}),
	name: ArgumentType.string({
		required: true,
		// TOOD fix with parameter or smth
		description: 'Hero name',
	}),
	grade: ArgumentType.number({
		required: true,
		description: 'Hero or SBW grade',
	}),
	text: ArgumentType.string({
		required: true,
		description: 'Full translation text'
	}),
};

type Arguments = typeof cmdArgs;

export class TranslateCommand extends BaseCommand<Arguments> {
	readonly args = cmdArgs;
	readonly argsOrderMatters = true;
	readonly category = CommandCategory.UTIL;
	readonly commandName = 'translate';
	readonly description = 'Submit translation request for hero or SBW field';
	readonly protected = false;

	async run(payload: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { args, reply } = payload;

		const {
			field, name, grade, text
		} = args;

		const result = heroes.search(name);

		if (!result) {
			await reply('Hero not found!');

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
				await reply('Soulbound weapon grade not found!');

				return {
					statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
					target: hero.id,
				};
			}
		} else {
			form = hero.forms.find(f => f.star === grade);

			if (!form) {
				await reply('Hero grade not found!');

				return {
					statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
					target: hero.id,
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

		try {
			await translations.submit(key, text, config.gameVersion);

			await reply('Translation request submitted!\nThanks for trying to make translations clearer');
		} catch (error) {
			await reply('Unable to submit your translation. Please, contact bot owner.');

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
