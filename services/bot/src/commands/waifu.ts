import { EmbedBuilder } from 'discord.js';

import { heroes } from '@cquest/data-provider';

import { random, imageUrl } from '../util/functions';

import BaseCommand from './abstract/BaseCommand';
import {
	CommandCategory, CommandPayload, CommandResult, CommandResultCode
} from '../common-types';

type EmptyArgs = {};

export class WaifuCommand extends BaseCommand<EmptyArgs> {
	readonly args = {};
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.MISC;
	readonly commandName = 'waifu';
	readonly description = 'Get your waifu';
	readonly protected = false;

	async run({ reply, author }: CommandPayload<EmptyArgs>): Promise<Partial<CommandResult>> {
		const heroez = heroes.list();

		const hero = heroez[random(0, heroez.length - 1)];

		await reply([
			new EmbedBuilder()
				.setImage(imageUrl(`heroes/${hero.forms[hero.forms.length - 1].image}`))
				.setFooter({ text: `${author.username}#${author.tag}` })
		]);

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'waifu',
		};
	}
}

export default new WaifuCommand();
