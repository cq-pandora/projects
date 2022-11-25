import { CommandResultCode, Scarecrow } from '@cquest/entities';
import {
	scarecrows, extractResult,
} from '@cquest/data-provider';

import {
	ArgumentType, CommandCategory, CommandPayload, CommandResult
} from '../common-types';
import { ScarecrowsEmbed } from '../embeds';

import BaseCommand from './abstract/BaseCommand';

const cmdArgs = {
	name: ArgumentType.string({
		required: false,
		description: 'Scarecrow name. If empty, all scarecrows will be shown',
		default: null,
	}),
};

type Arguments = typeof cmdArgs;

export class ScarecrowsCommand extends BaseCommand<Arguments> {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters: boolean = false;
	public readonly category: CommandCategory = CommandCategory.DB;
	public readonly commandName: string = 'scarecrow';
	public readonly description: string = 'Get scarecrow stats and info';
	public readonly protected: boolean = false;

	public async run({ reply, args, initial }: CommandPayload<typeof cmdArgs>): Promise<Partial<CommandResult>> {
		let entities: Scarecrow[];

		if (args.name) {
			const { results } = extractResult(scarecrows.searchAll(args.name));

			if (!results.length) {
				await reply('Scarecrow not found!');

				return {
					statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				};
			}

			entities = results;
		} else {
			entities = scarecrows.list();
		}

		const embed = new ScarecrowsEmbed({
			initial,
			scarecrows: entities,
		});

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: entities.map(g => g.id).join(','),
			args: JSON.stringify({ input: args.name }),
		};
	}
}

export default new ScarecrowsCommand();
