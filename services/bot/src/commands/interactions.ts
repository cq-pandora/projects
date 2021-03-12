import { MessageAttachment } from 'discord.js';

import {
	heroes, interactions, translate, extractResult
} from '@cquest/data-provider';
import { Interaction } from '@cquest/entities';
import logger from '@cquest/logger';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';
import { renderInteraction, chunk, allSettled } from '../util';

const cmdArgs: CommandArguments = {
	name: {
		required: false,
		description: 'Hero to filter by participation',
	}
};

export class InteractionsCommand extends BaseCommand {
	readonly args = cmdArgs;
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.DB;
	readonly commandName = 'interactions';
	readonly description = 'Get list of interactions';
	readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		const name = args.join(' ');

		const searchResult = heroes.search(name);

		if (!searchResult) {
			await message.channel.send('Hero not found!');

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
			await message.channel.send('Hero has no interactions!');

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

		for (const int of ints) {
			if (int.status === 'rejected') {
				logger.warn('Failed to render interaction', int.reason);
			} else {
				succeededInts.push(int.value);
			}
		}

		const msgs = chunk(succeededInts, 10);

		for (const msg of msgs) {
			await message.channel.send(msg.map((v, idx) => new MessageAttachment(v, `${idx}.png`)));
		}

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: hero.id,
			args: JSON.stringify({ name }),
		};
	}
}

export default new InteractionsCommand();
