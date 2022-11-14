import { EmbedBuilder } from 'discord.js';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, NoCommandArguments
} from '../common-types';

export class LennyCommand extends BaseCommand<NoCommandArguments> {
	public readonly args = {};
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.MISC;
	public readonly commandName = 'lenny';
	public readonly description = '( ͡° ͜ʖ ͡°)';
	public readonly protected = false;

	async run({ reply }: CommandPayload<NoCommandArguments>): Promise<Partial<CommandResult>> {
		await reply([
			new EmbedBuilder().setDescription('( ͡° ͜ʖ ͡°)')
		]);

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'lenny',
		};
	}
}

export default new LennyCommand();
