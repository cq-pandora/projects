import { SpSkillForm } from '@cquest/entities';
import { spSkills, extractResult } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';

import { SPSkillEmbed } from '../embeds';

const cmdArgs = {
	name: ArgumentType.string({
		required: true,
		description: 'Special skill name',
	}),
	level: ArgumentType.number({
		required: false,
		description: 'Skill level. Defaults to highest level',
		default: null,
	}),
};

type Arguments = typeof cmdArgs;

export class SpSkillCommand extends BaseCommand<Arguments> {
	readonly args = cmdArgs;
	readonly aliases = ['sp', 'skill'];
	readonly category = CommandCategory.DB;
	readonly commandName = 'sp-skill';
	readonly description = 'Get special skill info';
	readonly protected = false;

	async run({ args, reply, initial }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { level, name } = args;

		// const grade = parseGrade(args);
		// const name = parseQuery(args, [`${grade}`]);

		const searchResult = spSkills.search(name);

		if (!searchResult) {
			await reply('Skill not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				target: 'spskill',
			};
		}

		const { result: skill } = extractResult(searchResult);

		let form: SpSkillForm | undefined;
		if (level) {
			form = skill.forms.find(f => f.level === level);
		} else {
			form = skill.forms[skill.forms.length - 1];
		}

		if (!form) {
			await reply('No such level for this skill!');

			return {
				statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
				target: skill.id,
			};
		}

		const page = skill.forms.indexOf(form) + 1;

		const embed = new SPSkillEmbed({ skill, page, initial });

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: skill.id,
			args: JSON.stringify({ name, grade: level }),
		};
	}
}

export default new SpSkillCommand();
