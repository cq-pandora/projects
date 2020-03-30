import config from '../config';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode
} from '../common-types';

const embed = {
	title: 'Useful Links',
	description: 'Visit the [Crusaders Quest Database (cqdb)](https://goo.gl/fdg6M8)!',
	fields: config.links.map(v => ({
		name: v.title,
		value: v.entries.map(e => (e.url ? `[${e.title}](${e.url})` : `[[${e.title}]]`)).join('\n'),
		inline: true,
	}))
};

export class LinksCommand extends BaseCommand {
	readonly args = {};
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.UTIL;
	readonly commandName = 'links';
	readonly description = 'Some useful links';
	readonly protected = false;

	async run({ message }: CommandPayload): Promise<Partial<CommandResult>> {
		await message.channel.send({ embed });

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'links',
		};
	}
}

export default new LinksCommand();
