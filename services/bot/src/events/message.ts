import { Client, Message, TextChannel } from 'discord.js';

import { CommandResultCode, CommandResult } from '@cquest/entities';
import { stats } from '@cquest/db';
import { commands as logger } from '@cquest/logger';

import { getPermittedCommands, isErrorIgnored } from '../util';
import config from '../config';

export default (client: Client): (msg: Message) => Promise<void> => {
	const mentionRe = new RegExp(`^<@!?${client.user!.id}>`);

	return async (message): Promise<void> => {
		// ignore bot messages
		if (message.author.bot) {
			return;
		}

		const noPrefix = !config.prefix || !message.content.startsWith(config.prefix);
		const noMention = !mentionRe.test(message.content);

		// ignore if not a command
		if (noPrefix && noMention) {
			return;
		}

		// parse message into command and arguments
		let args: string[];
		let command: string;
		if (noMention) {
			args = message.content.split(' ').filter(Boolean);
			command = args
				.shift()!
				.slice(config.prefix.length)
				.toLowerCase();
		} else {
			args = message.content
				.replace(mentionRe, '')
				.trim()
				.split(' ')
				.filter(Boolean);

			if (!args.length) return;

			command = args.shift()!.toLowerCase();
		}

		const alias = config.aliases.get('commands', command);
		const executable = config.commands[command] || config.commands[alias || '$$_NO_COMMAND_$$'];

		if (!executable) {
			// message.channel.send('Command not found!');
			return;
		}

		const cmdId = (new Date()).getTime().toString(32);

		// I'm sorry for this long line :c
		logger.verbose(`{${cmdId}} Received request for '${executable.commandName}' ${args.length ? `with arguments: "${args.join(', ')}"` : 'without arguments'} from  ${message.author.tag}#${message.author.id}@${message.channel.id}@${message.guild === null ? 'DM' : `${message.guild.name}#${message.guild.id}`}`);

		if (!(
			message.guild === null
            || getPermittedCommands(message).includes(executable.commandName)
		) && !message.member!.hasPermission('ADMINISTRATOR', { checkAdmin: true, checkOwner: true })) {
			logger.verbose(`{${cmdId}} User ${message.author.tag}#${message.author.id} had not enough permissions to execute`);

			await message.channel.send('This command is forbidden here!');

			return;
		}

		let serverId: string;

		if (message.channel instanceof TextChannel) {
			serverId = message.channel.guild.id;
		} else {
			serverId = message.author.id;
		}

		const meta = {
			args: '',
			target: null,
			command: executable.commandName,
			userId: message.author.id,
			channelId: message.channel.id,
			server: serverId,
			sentTo: message.channel.type,
			content: message.content,
		};

		let stat = {
			statusCode: CommandResultCode.SUCCESS
		};

		try {
			if (executable.protected && message.author.id !== config.ownerId) {
				await message.channel.send('No enough permissions!');

				stat.statusCode = CommandResultCode.NOT_ENOUGH_PERMISSIONS;
			} else {
				const response = await executable.run({ client, message, args });

				stat = {
					...stat,
					...response,
				};
			}

			logger.verbose(`{${cmdId}} Command finished successfully`);
		} catch (error) {
			if (!isErrorIgnored(error)) {
				stat.statusCode = CommandResultCode.FATAL;

				logger.error(`{${cmdId}} Unexpected error while executing command:`, error);

				await message.channel.send('Error while executing command!');
			}
		}

		try {
			const totalStats = {
				...meta,
				...stat
			};
			await stats.submit(
				new CommandResult(
					totalStats.args,
					totalStats.userId,
					totalStats.channelId,
					totalStats.server,
					totalStats.sentTo,
					totalStats.content,
					totalStats.statusCode,
					totalStats.command,
					totalStats.target,
				)
			);
		} catch (error) {
			logger.error(`{${cmdId}} Unable to submit stats`, error);
		}
	};
};
