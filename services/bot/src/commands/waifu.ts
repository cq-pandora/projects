import {
	random, imageUrl
} from '../util/functions';

import { heroes } from '../cq-data';

import BaseCommand from './abstract/BaseCommand';
import {
	CommandCategory, CommandPayload, CommandResult, CommandResultCode
} from '../common-types';

const heroez = heroes.list();

export class WaifuCommand extends BaseCommand {
	readonly args = {};
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.MISC;
	readonly commandName = 'waifu';
	readonly description = 'Get your waifu';
	readonly protected = false;

	async run({ message }: CommandPayload): Promise<Partial<CommandResult>> {
		const hero = heroez[random(0, heroez.length - 1)];

		await message.channel.send({
			embed: {
				image: {
					url: imageUrl(`heroes/${hero.forms[hero.forms.length - 1].image}`),
				},
				footer: {
					text: `${message.author.username}#${message.author.discriminator}`,
				}
			}
		});

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'waifu',
		};
	}
}

export default new WaifuCommand();
