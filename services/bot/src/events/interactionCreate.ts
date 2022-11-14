import {
	Client, Interaction,
} from 'discord.js';

import { CommandResultCode, CommandResult } from '@cquest/entities';
import { stats } from '@cquest/db';
import { commands as logger } from '@cquest/logger';

import { isErrorIgnored } from '../util';
import config from '../config';

export default (client: Client): (interaction: Interaction) => Promise<void> => async (interaction): Promise<void> => {
	if (!interaction.isChatInputCommand()) return;

	function reply(msg: string | [any]): Promise<void> {
		return Promise.resolve();
	}

	function editReply(msg: string | [any]): Promise<void> {
		return Promise.resolve();
	}

	// parse message into command and arguments
	const args = interaction.options.data.map(v => String(v.value));
	const command = interaction.commandName;

	const alias = config.aliases.get('commands', command);
	const executable = config.commands[command] || config.commands[alias || '$$_NO_COMMAND_$$'];

	const cmdId = (new Date()).getTime().toString(32);

	// I'm sorry for this long line :c
	logger.verbose(`{${cmdId}} Received request for '${executable.commandName}' ${args.length ? `with arguments: "${args.join(', ')}"` : 'without arguments'} from  ${interaction.user.tag}#${interaction.user.id}@${interaction.channelId}@${interaction.guild === null ? 'DM' : `${interaction.guild.name}#${interaction.guild.id}`}`);

	// FIXME checks should be made on discord level
	// if (!(
	// message.guild === null
	// || getPermittedCommands(message).includes(executable.commandName)
	// ) && !message.member!.permissions.has(
	// PermissionsBitField.Flags.Administrator, true
	// )) {
	// logger.verbose(`{${cmdId}} User ${message.author.tag}#${message.author.id}
	// had not enough permissions to execute`);

	// await message.channel.send('This command is forbidden here!');

	// return;
	// }

	let serverId: string;

	if (interaction.inGuild()) {
		serverId = interaction.guildId;
	} else {
		serverId = interaction.user.id;
	}

	const meta = {
		args: '',
		target: null,
		command: executable.commandName,
		userId: interaction.user.id,
		channelId: interaction.channelId,
		server: serverId,
		sentTo: interaction.channel?.type,
		content: '',
	};

	let stat = {
		statusCode: CommandResultCode.SUCCESS
	};

	try {
		// FIXME make protected commnands available only in Pandora server
		if (executable.protected && interaction.user.id !== config.ownerId) {
			await interaction.reply('No enough permissions!');

			stat.statusCode = CommandResultCode.NOT_ENOUGH_PERMISSIONS;
		} else {
			const response = await executable.run({
				client,
				args: executable.parseArguments(interaction.options),
				reply,
				editReply,
				author: interaction.user,
				deleteOriginal: () => interaction.deleteReply(),
			});

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

			await interaction.reply('Error while executing command!');
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
