import { ChampionForm } from '@pandora/entities';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';
import { ChampionEmbed } from '../embeds';
import { parseQuery, parseGrade } from '../util';
import { champions, extractResult } from '../cq-data';

const cmdArgs: CommandArguments = {
	name: {
		required: true,
		description: 'Champion name',
	},
	grade: {
		required: false,
		description: 'Champion level. Defaults to highest possible',
	}
};

export class ChampionCommand extends BaseCommand {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'champion';
	public readonly description = 'Get champion info';
	public readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) return this.sendUsageInstructions(payload);

		const grade = parseGrade(args);
		const name = parseQuery(args, [`${grade}`]);

		const { result: champion, locale } = extractResult(champions.search(name));

		if (!champion) {
			await message.channel.send('Champion not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		let form: ChampionForm | undefined;
		if (grade) {
			form = champion.forms.find(f => f.grade === grade);
		} else {
			form = champion.forms[champion.forms.length - 1];
		}

		if (!form) {
			await message.channel.send('Champion level not found!');

			return {
				statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
			};
		}

		const page = champion.forms.indexOf(form) + 1;

		const embed = new ChampionEmbed({
			initialMessage: message, champion, page, locale
		});

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: champion.id,
			args: JSON.stringify({ name, grade }),
		};
	}
}

export default new ChampionCommand();
