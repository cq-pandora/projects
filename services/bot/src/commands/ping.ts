import { EmbedBuilder } from 'discord.js';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode
} from '../common-types';

export class PingCommand extends BaseCommand {
	readonly args = {};
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.BOT;
	readonly commandName = 'ping';
	readonly description = 'Show message base reaction time';
	readonly protected = false;

	async run({ message }: CommandPayload): Promise<Partial<CommandResult>> {
		const newMessage = await message.channel.send({
			embeds: [
				new EmbedBuilder()
					.setDescription('🏓 Pinging...')
			],
		});

		await newMessage.edit({
			embeds: [
				new EmbedBuilder()
					.setTitle('🏓 Pong!')
					.setDescription(`${newMessage.createdTimestamp - message.createdTimestamp} ms`)
			],
		});

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'ping',
		};
	}
}

export default new PingCommand();
