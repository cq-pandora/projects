import { Message } from 'discord.js';

import { aliases, Alias } from '@pandora/db';

import { splitText } from '../util';
import config from '../config';
import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments, ContextType
} from '../common-types';
import { PaginationEmbed } from '../embeds';
import { LocalizableMessageEmbed } from '../embeds/LocalizableMessageEmbed';

import BaseCommand from './abstract/BaseCommand';

const aliasesToEmbeds = (ts: Alias[]): LocalizableMessageEmbed[] => {
	const strings = ts
		.sort((a, b) => `${a.context}`.localeCompare(b.context))
		.map(({ context, alias, for: fogh }) => `${context}: ${alias} => ${fogh}`)
		.join('\n');

	return splitText(strings, 1024, '\n').map((text: string, idx: number, total: string[]) => (
		new LocalizableMessageEmbed()
			.setTitle('Aliases list')
			.setFooter(`Page ${idx}/${total}`)
			.addField('<context>: <alias> => <targer>', text)
	));
};

type ActionArguments = {
	action: string;
	alias: string;
	context: ContextType;
	for: string;
	originalArgs: readonly string[];
};

type Action = (message: Message, args: ActionArguments) => Promise<void>;

const actions: Record<string, Action> = {
	'list-pending': async (message: Message, { originalArgs }) => {
		try {
			const fogh = originalArgs.length ? originalArgs.join(' ') : null;

			const list = await aliases.list(fogh);

			if (!list.length) {
				await message.channel.send('No pending aliases!');
				return;
			}

			const embed = new PaginationEmbed({ initialMessage: message })
				.setArray(aliasesToEmbeds(list))
				.setChannel(message.channel)
				.showPageIndicator(false)
				.send();

			await embed;
		} catch (error) {
			await message.channel.send('Unable to list aliases. Please, contact bot owner.');

			throw error;
		}
	},
	list: async (message) => {
		try {
			const list = await aliases.listAll();

			if (!list.length) {
				await message.channel.send('No aliases defined!');
				return;
			}

			const embed = new PaginationEmbed({ initialMessage: message })
				.setArray(aliasesToEmbeds(list))
				.setChannel(message.channel)
				.showPageIndicator(false);

			await embed.send();
		} catch (error) {
			await message.channel.send('Unable to list aliases. Please, contact bot owner.');

			throw error;
		}
	},
	accept: async (message, { alias, context }) => {
		try {
			if (!context) {
				await message.channel.send('Context may not be empty');
			}

			const res = await aliases.accept(alias, context);

			if (!res) {
				await message.channel.send('Alias does not exist for specified context');
			} else {
				config.aliases.set(res.context, res.alias, res.for);

				await message.channel.send('Alias accepted!');
			}
		} catch (error) {
			await message.channel.send('Unable to accept alias. Please, contact bot owner.');

			throw error;
		}
	},
	decline: async (message, { alias, context }) => {
		try {
			if (!context) {
				await message.channel.send('Context may not be empty');
			}

			await aliases.decline(alias, context);

			await message.channel.send('Alias declined!');
		} catch (error) {
			await message.channel.send('Unable to alias translation. Please, contact bot owner.');

			throw error;
		}
	},
	clear: async (message, { originalArgs: [fogh] }) => {
		try {
			await aliases.declineAllUnaccepted(fogh);

			await message.channel.send('Aliases cleared!');
		} catch (error) {
			await message.channel.send('Unable to clear aliases. Please, contact bot owner.');

			throw error;
		}
	}
};

const actionsText = Object.keys(actions).join(', ');

const cmdArgs: CommandArguments = {
	action: {
		required: true,
		description: `Action to perform.\nCan be ${actionsText}`,
	},
	alias: {
		required: false,
		description: 'Alias to work with. **Important**: alias should not contain space',
	},
	context: {
		required: false,
		description: 'Command name, where this alias applies',
	},
	for: {
		required: false,
		description: 'Alias target',
	}
};

export class ManageAliasesCommand extends BaseCommand {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = true;
	public readonly category = CommandCategory.PROTECTED;
	public readonly commandName = 'manage-aliases';
	public readonly description = 'Cross-server aliases management commands';
	public readonly protected = true;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		if (!payload.args.length) return this.sendUsageInstructions(payload);

		const { message, args: [raw, alias, context, ...etc] } = payload;

		const nameAction = raw.toLowerCase();
		const forr = etc.join(' ');

		const args: ActionArguments = {
			action: nameAction,
			alias,
			context: context as ContextType,
			for: forr,
			originalArgs: payload.args,
		};

		const action = actions[nameAction];

		if (!action) {
			await message.channel.send('Unknown action!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				target: 'action',
				args: JSON.stringify(args),
			};
		}

		await action(message, args);

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: alias || '*',
			args: JSON.stringify(args),
		};
	}
}

export default new ManageAliasesCommand();
