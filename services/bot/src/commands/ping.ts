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
			embed: {
				description: 'Pinging...'
			}
		});

		await newMessage.edit({
			embed: {
				title: 'Pong! 🏓',
				description: `${newMessage.createdTimestamp - message.createdTimestamp} ms`
			}
		});

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'ping',
		};
	}
}

export default new PingCommand();
