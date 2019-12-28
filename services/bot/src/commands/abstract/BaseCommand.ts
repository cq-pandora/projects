import { MessageEmbedOptions } from 'discord.js';

import {
	CommandCategory, CommandPayload, CommandResult, CommandArguments, CommandInfoResultField,
	ICommand, CommandResultCode,
} from '../../common-types';

import getPrefix from '../../util/functions/getPrefix';

export default abstract class BaseCommand implements ICommand {
	public abstract readonly category: CommandCategory;
	public abstract readonly args: CommandArguments;
	public abstract readonly argsOrderMatters: boolean;
	public abstract readonly description: string;
	public abstract readonly commandName: string;
	public abstract readonly protected: boolean;

	abstract async run(payload: CommandPayload): Promise<Partial<CommandResult>>;

	protected async sendUsageInstructions(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const embed = await this.instructions(payload);

		await payload.message.channel.send({ embed });

		return {
			statusCode: CommandResultCode.NOT_ENOUGH_ARGS,
		};
	}

	async instructions({ message }: CommandPayload): Promise<MessageEmbedOptions> {
		const prefix = getPrefix(message);

		const argsStrings: Array<string> = [];
		const fields: Array<CommandInfoResultField> = [];

		for (const [name, { required, description }] of Object.entries(this.args)) {
			let argName: string;

			if (required) {
				argName = `<${name}>`;
			} else {
				argName = `[${name}]`;
			}

			argsStrings.push(argName);
			fields.push({
				name: argName,
				value: description,
			} as CommandInfoResultField);
		}

		const embed: MessageEmbedOptions = {
			title: `${prefix}${this.commandName} ${argsStrings.join(' ')}`,
			fields,
		};

		if (this.argsOrderMatters) {
			embed.footer = { text: 'Argument order matters!' };
		}

		return embed;
	}
}
