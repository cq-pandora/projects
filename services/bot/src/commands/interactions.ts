import {
	heroes, interactions, translate, extractResult
} from '@cquest/data-provider';
import { Interaction } from '@cquest/entities';
import logger from '@cquest/logger';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';
import { renderInteraction, chunk, allSettled } from '../util';

const cmdArgs = {
	name: ArgumentType.string({
		required: true,
		description: 'Hero to filter by participation',
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

		const searchResult = heroes.search(name);

		if (!searchResult) {
			await reply('Hero not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const { result: hero, locales } = extractResult(searchResult);

		const heroInteractions = hero.forms.reduce(
			(r, v) => r.concat(extractResult(interactions.searchAll(v.id)).results),
			[] as Interaction[]
		);

		if (!heroInteractions.length) {
			await reply('Hero has no interactions!');

			return {
				statusCode: CommandResultCode.SUCCESS,
			};
		}

		const ints = await allSettled(heroInteractions.map(
			async i => {
				const actors = i.actors.map(actor => ({
					text: translate(actor.text, locales[0]).replace('\n', ' '),
					imageKey: actor.imageKey,
				}));

				const img = await renderInteraction(actors);

				return img.getBufferAsync('image/png');
			}
		));

		const succeededInts = [] as Buffer[];

		if (!heroInteractions.length) {
			await reply('Hero has no interactions!');

			return {
				statusCode: CommandResultCode.SUCCESS,
			};
		}

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
			// await reply({
			// files: msg.map(v => ({ attachment: v }))
			// });
		}

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: hero.id,
			args: JSON.stringify(args),
		};
	}
}

export default new InteractionsCommand();
