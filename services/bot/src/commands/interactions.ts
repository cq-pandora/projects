import { interactions, translate, extractResult } from '@cquest/data-provider';
import logger from '@cquest/logger';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';
import {
	renderInteraction, chunk, allSettled, searchHero
} from '../util';

const cmdArgs = {
	name: ArgumentType.string({
		required: true,
		description: 'Hero to filter by participation. Add a class or type to tell same-named heroes apart',
	}),
};

type Arguments = typeof cmdArgs;

export class InteractionsCommand extends BaseCommand<Arguments> {
	readonly args = cmdArgs;
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.DB;
	readonly commandName = 'interactions';
	readonly description = 'Get list of interactions';
	readonly protected = false;

	async run(payload: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { args, reply } = payload;

		const { name } = args;

		const searchResult = searchHero(name);

		if (!searchResult) {
			await reply('Hero not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const { result: hero, locales } = extractResult(searchResult);

		// An interaction can feature several forms of the same hero; list it once
		const heroInteractions = [...new Set(hero.forms.flatMap(
			form => extractResult(interactions.searchAll(form.id)).results
		))];

		if (!heroInteractions.length) {
			await reply('Hero has no interactions!');

			return {
				statusCode: CommandResultCode.SUCCESS,
			};
		}

		const ints = await allSettled(heroInteractions.map(
			async i => {
				const actors = i.actors.map(actor => ({
					text: translate(actor.text, locales[0]).replaceAll('\n', ' '),
					imageKey: actor.imageKey,
				}));

				const img = await renderInteraction(actors);

				return img.getBuffer('image/png');
			}
		));

		const succeededInts = [] as Buffer[];

		for (const int of ints) {
			if (int.status === 'rejected') {
				logger.warn('Failed to render interaction', int.reason);
			} else {
				succeededInts.push(int.value);
			}
		}

		const msgs = chunk(succeededInts, 10);

		for (const msg of msgs) {
			// FIXME attachements
			await reply({
				files: msg.map(v => ({ attachment: v }))
			});
		}

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: hero.id,
			args: JSON.stringify(args),
		};
	}
}

export default new InteractionsCommand();
