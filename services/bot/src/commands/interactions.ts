import { Interaction } from '@pandora/entities';
import { MessageAttachment } from 'discord.js';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';
import { renderInteraction, chunk } from '../util';
import {
	heroes, interactions, translate, extractResult
} from '../cq-data';

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

		const { result: hero, locales } = extractResult(heroes.search(name));

		if (!hero) {
			await message.channel.send('Hero not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

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

		const ints = await Promise.all(heroInteractions.map(
			async i => {
				const actors = i.actors.map(actor => ({
					text: translate(actor.text, locales[0]).replace('\n', ' '),
					imageKey: actor.imageKey,
				}));

				const img = await renderInteraction(actors);

				return img.getBufferAsync('image/png');
			}
		));

		const msgs = chunk(ints, 10);

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
