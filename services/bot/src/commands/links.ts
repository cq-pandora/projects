import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode
} from '../common-types';

export class LinksCommand extends BaseCommand {
	readonly args = {};
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.UTIL;
	readonly commandName = 'links';
	readonly description = 'Some useful links';
	readonly protected = false;

	async run({ message }: CommandPayload): Promise<Partial<CommandResult>> {
		const embed = {
			title: 'Useful Links',
			description: 'Visit the [Crusaders Quest Database (cqdb)](https://goo.gl/fdg6M8)!',
			fields: [
				{
					name: 'Guides',
					value: '[Hero skills/builds list](http://bit.ly/2NNDlbg)\n[AFK](http://bit.ly/CQAfkGuide)',
					inline: true,
				},
				{
					name: 'Tier Lists',
					value: '[[Placeholder]]',
					inline: true,
				},
				{
					name: 'Raid',
					value: '[kamakiller\'s Loki](https://bit.ly/CQLokiIncarnateReupload)\n[Manacar Comic](https://goo.gl/aJ8Yoy)',
					inline: true,
				},
				{
					name: 'Champions',
					value: '[Vyrlokar](https://goo.gl/M37qRm)',
					inline: true,
				},
				{
					name: 'How To Get',
					value: '[Lionel\'s skin](https://goo.gl/9BXBkD)\n[Himiko\'s skin](https://goo.gl/5yDbjr)',
					inline: true,
				},
				{
					name: 'Challenge',
					value: '[kamakiller](https://bit.ly/CQChallengeModeReupload)\n[Sigils list](http://bit.ly/2NCLFu9)',
					inline: true,
				},
				{
					name: 'LoPF',
					value: '[Nyaa](https://goo.gl/iqppI0)\n[Shintouyu](https://goo.gl/4i8nCb)\n[LoPF map](https://goo.gl/YtlDQH)',
					inline: true,
				},
				{
					name: 'Hasla Guides',
					value: '[Comics](https://goo.gl/HPsANc)\n[Season 2](https://goo.gl/UQdjhw)\n[Berry system](https://goo.gl/jbgmLa)',
					inline: true,
				},
				{
					name: 'Miscellaneous',
					value: '[Leveling guide](https://i.redd.it/ya5mgw9xvfk01.jpg)\n[cq-assets](https://github.com/cq-pandora/assets/)\n[block-map](http://bit.ly/CQBlockMap)',
					inline: true,
				},
			],
		};

		await message.channel.send({ embed });

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'links',
		};
	}
}

export default new LinksCommand();
