import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode
} from '../common-types';

export class LennyCommand extends BaseCommand {
	public readonly args = {};
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.MISC;
	public readonly commandName = 'lenny';
	public readonly description = '( ͡° ͜ʖ ͡°)';
	public readonly protected = false;

	async run({ message }: CommandPayload): Promise<Partial<CommandResult>> {
		const embed = {
			description: '( ͡° ͜ʖ ͡°)'
		};

		await message.channel.send({ embed });

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'lenny',
		};
	}
}

export default new LennyCommand();
