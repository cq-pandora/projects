import { User } from 'discord.js';

import BaseCommand from './abstract/BaseCommand';
import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, NoCommandArguments
} from '../common-types';
import config from '../config';

export class AboutCommand extends BaseCommand<NoCommandArguments> {
	public readonly args = {};
	public readonly description = 'Some basic info about bot';
	public readonly commandName = 'about';
	public readonly category = CommandCategory.BOT;
	public readonly argsOrderMatters = true;
	public readonly protected = false;

	async run({ client, reply }: CommandPayload<NoCommandArguments>): Promise<Partial<CommandResult>> {
		const owner = await client.users.fetch(config.ownerId) as User;

		await reply([
			{
				title: 'About',
				description: `Made with ❤ by ${owner.username} (${owner.tag}).\n\nThis bot is not affiliated, associated, authorized by, endorsed by, or in any way officially connected with NHN Entertainment Corp., LoadComplete Inc., or any of their subsidiaries or their affiliates.`,
				fields: [
					{
						name: `Invite ${client.user?.username}`,
						value: '[bit.ly/InvitePandora](http://bit.ly/InvitePandora)',
						inline: true,
					},
					{
						name: 'Join Servers',
						value: '[Pandora Dev Server](https://discord.gg/pK9qsJY)\n[Crusaders Quest](https://discord.gg/6TRnyhj)',
						inline: true,
					},
					{
						name: 'Git repos',
						value: '[/cq-pandora/projects](https://github.com/cq-pandora/projects)\n[/cq-pandora/cq-assets](https://github.com/cq-pandora/assets/)',
						inline: true,
					},
				],
			},
		]);

		return {
			target: 'about',
			statusCode: CommandResultCode.SUCCESS,
		};
	}
}

export default new AboutCommand();
