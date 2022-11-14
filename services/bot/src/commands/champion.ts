import { ChampionForm } from '@cquest/entities';
import { champions, extractResult } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';
import { ChampionEmbed } from '../embeds';

const cmdArgs = {
	name: ArgumentType.string({
		required: true,
		description: 'Champion name',
	}),
	grade: ArgumentType.number({
		required: false,
		description: 'Champion level. Defaults to highest possible',
		default: 0,
	}),
};

type Arguments = typeof cmdArgs;

export class ChampionCommand extends BaseCommand<Arguments> {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'champion';
	public readonly description = 'Get champion info';
	public readonly protected = false;

	async run({ reply, args }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { name, grade } = args;
		const searchResult = champions.search(name);

		if (!searchResult) {
			await reply('Champion not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const { result: champion, locales } = extractResult(searchResult);

		let form: ChampionForm | undefined;
		if (grade) {
			form = champion.forms.find(f => f.grade === grade);
		} else {
			form = champion.forms[champion.forms.length - 1];
		}

		if (!form) {
			await reply('Champion level not found!');

			return {
				statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
			};
		}

		const page = champion.forms.indexOf(form) + 1;

		const embed = new ChampionEmbed({
			initialMessage: undefined, champion, page, locales
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
