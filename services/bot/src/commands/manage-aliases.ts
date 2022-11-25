import { aliases, Alias } from '@cquest/db';

import { splitText } from '../util';
import config from '../config';
import {
	CommandCategory, CommandResult, CommandPayload, CommandReply, CommandResultCode, ContextType, ArgumentType,
	ContextValues,
} from '../common-types';
import {
	EmbedSource, InitialMessageSource, PaginationEmbed, PandoraEmbed
} from '../embeds';

import BaseCommand from './abstract/BaseCommand';

const aliasesToEmbeds = (ts: Alias[]): EmbedSource[] => {
	const strings = ts
		.sort((a, b) => `${a.context}`.localeCompare(b.context))
		.map(({ context, alias, for: fogh }) => `${context}: ${alias} => ${fogh}`)
		.join('\n');

	return splitText(strings, 1024, '\n').map((text: string, idx: number, total: string[]) => (
		new PandoraEmbed()
			.setTitle('Aliases list')
			.setFooter(`Page ${idx}/${total}`)
			.addField('<context>: <alias> => <targer>', text)
			.toEmbed()
	));
};

type ActionArguments = {
	action: string;
	alias: string;
	context: ContextType;
	for: string;
};

type Action = (reply: CommandReply, args: ActionArguments, initial: InitialMessageSource) => Promise<void>;

const actions: Record<string, Action> = {
	'list-pending': async (reply, { for: forr }, initial) => {
		try {
			const fogh = forr || null;

			const list = await aliases.list(fogh);

			if (!list.length) {
				await reply('No pending aliases!');
				return;
			}

			const embed = new PaginationEmbed({ initial })
				.setArray(aliasesToEmbeds(list))
				// .setChannel(message.channel)
				.showPageIndicator(false)
				.send();

			await embed;
		} catch (error) {
			await reply('Unable to list aliases. Please, contact bot owner.');

			throw error;
		}
	},
	list: async (reply, _, initial) => {
		try {
			const list = await aliases.listAll();

			if (!list.length) {
				await reply('No aliases defined!');
				return;
			}

			const embed = new PaginationEmbed({ initial })
				.setArray(aliasesToEmbeds(list))
				// .setChannel(message.channel)
				.showPageIndicator(false);

			await embed.send();
		} catch (error) {
			await reply('Unable to list aliases. Please, contact bot owner.');

			throw error;
		}
	},
	accept: async (reply, { alias, context }) => {
		try {
			if (!context) {
				await reply('Context may not be empty');
			}

			const res = await aliases.accept(alias, context);

			if (!res) {
				await reply('Alias does not exist for specified context');
			} else {
				config.aliases.set(res.context, res.alias, res.for);

				await reply('Alias accepted!');
			}
		} catch (error) {
			await reply('Unable to accept alias. Please, contact bot owner.');

			throw error;
		}
	},
	decline: async (reply, { alias, context }) => {
		try {
			if (!context) {
				await reply('Context may not be empty');
			}

			await aliases.decline(alias, context);

			await reply('Alias declined!');
		} catch (error) {
			await reply('Unable to alias translation. Please, contact bot owner.');

			throw error;
		}
	},
	clear: async (reply, { for: forr }) => {
		try {
			await aliases.declineAllUnaccepted(forr);

			await reply('Aliases cleared!');
		} catch (error) {
			await reply('Unable to clear aliases. Please, contact bot owner.');

			throw error;
		}
	}
};

const cmdArgs = {
	action: ArgumentType.choice({
		required: true,
		choices: Object.keys(actions).reduce((r, v) => ({
			...r,
			[v]: v,
		}), {}),
		description: 'Action to perform',
	}),
	alias: ArgumentType.string({
		required: false,
		default: null,
		description: 'Alias to work with',
	}),
	context: ArgumentType.choice({
		required: false,
		choices: ContextValues.reduce((r, v) => ({
			...r,
			[v.replace('-', ' ')]: v
		}), {}),
		default: null,
		description: 'Command name, where this alias applies',
	}),
	for: ArgumentType.string({
		required: false,
		default: null,
		description: 'Alias target',
	}),
};

type Arguments = typeof cmdArgs;

export class ManageAliasesCommand extends BaseCommand<Arguments> {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = true;
	public readonly category = CommandCategory.PROTECTED;
	public readonly commandName = 'manage-aliases';
	public readonly description = 'Cross-server aliases management commands';
	public readonly protected = true;

	async run({ args, reply, initial }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const {
			action: actionName,
			alias,
			context,
			for: forr
		} = args;

		const actionArgs: ActionArguments = {
			action: actionName,
			alias,
			context: context as ContextType,
			for: forr,
		};

		const action = actions[actionName];

		if (!action) {
			await reply('Unknown action!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				target: 'action',
				args: JSON.stringify(args),
			};
		}

		await action(reply, actionArgs, initial);

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: alias || '*',
			args: JSON.stringify(args),
		};
	}
}

export default new ManageAliasesCommand();
