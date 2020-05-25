import { SpSkillForm } from '@pandora/entities';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';

import { SPSkillEmbed } from '../embeds';

import { parseQuery, parseGrade } from '../util';
import { spSkills, extractResult } from '../cq-data';

const cmdArgs: CommandArguments = {
	name: {
		required: true,
		description: 'Special skill name',
	},
	level: {
		required: false,
		description: 'Skill level. Defaults to highest level',
	}
};

export class SpSkillCommand extends BaseCommand {
	readonly args = cmdArgs;
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.DB;
	readonly commandName = 'sp-skill';
	readonly description = 'Get special skill info';
	readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) return this.sendUsageInstructions(payload);

		const grade = parseGrade(args);
		const name = parseQuery(args, [`${grade}`]);

		const searchResult = spSkills.search(name);

		if (!searchResult) {
			await message.channel.send('Skill not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				target: 'spskill',
			};
		}

		const { result: skill, locales } = extractResult(searchResult);

		let form: SpSkillForm | undefined;
		if (grade) {
			form = skill.forms.find(f => f.level === grade);
		} else {
			form = skill.forms[skill.forms.length - 1];
		}

		if (!form) {
			await message.channel.send('No such level for this skill!');

			return {
				statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
				target: skill.id,
			};
		}

		const page = skill.forms.indexOf(form) + 1;

		const embed = new SPSkillEmbed({
			initialMessage: message, skill, page, locales
		});

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: skill.id,
			args: JSON.stringify({ name, grade }),
		};
	}
}

export default new SpSkillCommand();
