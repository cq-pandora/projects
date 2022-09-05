import { EmbedBuilder } from 'discord.js';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../common-types';
import { groupBy } from '../util';
import config from '../config';

const cmdArgs: CommandArguments = {
	command: {
		required: false,
		description: 'Command name',
	}
};

export class HelpCommand extends BaseCommand {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.BOT;
	public readonly commandName = 'help';
	public readonly description = 'Show command list, or command instruction';
	public readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (args.length) {
			const cmdName = config.aliases.get('commands', args[0]) || args[0];
			const command = config.commands[cmdName];

			if (!command) {
				await message.channel.send('Command not found');

				return {
					statusCode: CommandResultCode.ENTITY_NOT_FOUND,
					args: JSON.stringify({ commandName: args[0] })
				};
			}

			const embed = await command.instructions(payload);

			await message.channel.send({ embeds: [embed] });

			return {
				statusCode: CommandResultCode.SUCCESS,
				target: command.commandName,
				args: JSON.stringify({ commandName: args[0] })
			};
		}

		await message.channel.send({
			embeds: [
				new EmbedBuilder()
					.setTitle('Commands')
					.setDescription(`Prefix: ${config.prefix}, ${message.client.user}`)
					.addFields(
						Object.entries(groupBy(Object.values(config.commands), 'category'))
							.map(([name, cmds]) => ({
								name,
								inline: false,
								value: cmds
									.map((cmd) => {
										const aliases = config.aliases.getCommandAliases(cmd.commandName);

										if (!aliases) return cmd.commandName;

										return `${cmd.commandName} (${aliases.join(', ')})`;
									})
									.join(', ')
							}))
					)
			]
		});

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'help',
		};
	}
}

export default new HelpCommand();
