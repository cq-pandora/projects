import { permissions } from '@cquest/db';

import { extractMentions, parseQuery } from '../util';
import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments, PermissionTarget
} from '../common-types';
import config from '../config';

import BaseCommand from './abstract/BaseCommand';

const cmdArgs: CommandArguments = {
	mode: {
		required: true,
		description: 'Filter mode. Can be **w**hitelist, **b**lacklist or **r**emove',
	},
	targets: {
		required: false,
		description: 'Mentions of users, channels or roles to apply action to. If not specified, current channel is used instead',
	},
	commands: {
		required: false,
		description: 'Anything that is not mention and not fist argument is treated as command.\nIf not specified, list will be cleared',
	},
};

const modes: Record<string, number> = {
	w: 1,
	b: 0,
	r: -1,
	whitelist: 1,
	blacklist: 0,
	remove: -1,
};

export class PermissionsCommand extends BaseCommand {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = true;
	public readonly category = CommandCategory.PROTECTED;
	public readonly commandName = 'permissions';
	public readonly description = 'Forbid some command, or allow only command for channel/role/user';
	public readonly protected = false;

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) return this.sendUsageInstructions(payload);

		if (message.guild === null) {
			await message.channel.send('This command designed only for servers!');

			return {
				statusCode: CommandResultCode.WRONG_CHANNEL_TYPE,
			};
		}

		if (!message.member!.permissions.has('Administrator', true)) {
			await message.channel.send('You must be able to manage server in order to edit permissions!');

			return {
				statusCode: CommandResultCode.NOT_ENOUGH_PERMISSIONS,
			};
		}

		const [modeNameRaw, ...rest] = args;

		const modeName = modeNameRaw.toLowerCase();

		const mode = modes[modeName];

		if (mode !== 0 && !mode) {
			await message.channel.send('Unknown mode!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				target: 'mode',
				args: JSON.stringify({ mode: modeName }),
			};
		}

		let targets = extractMentions(rest.join(' '));
		const parsedCommands = parseQuery(rest, targets.map(t => t.text)).split(' ').filter(s => s.trim());

		if (!targets.length) {
			targets = [{ type: 'channel', id: message.channel.id, text: '' }];
		}

		const mergedTargets = targets
			.map(t => config.permissions.merge(
				message.guild!.id, t.type as PermissionTarget, t.id, mode, parsedCommands
			));

		const shouldBeCleared = mergedTargets.filter(t => !t.commands.length);
		const shouldBeSet = mergedTargets.filter(t => Boolean(t.commands.length));

		if (shouldBeSet.length) {
			const toBeSet = await permissions.set(message.guild.id, shouldBeSet);

			for (const p of toBeSet) {
				config.permissions.set(message.guild.id, p.targetType, p.targetId, p.mode, p.commands, p.priority);
			}
		}

		if (shouldBeCleared.length) {
			const toBeCleared = await permissions.clear(shouldBeCleared);

			for (const p of toBeCleared) {
				config.permissions.set(p.serverId, p.targetType, p.targetId, 0, []);
			}
		}

		await message.channel.send('Permissions updated!');

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: targets.map(t => `${t.id}@${t.type}`).join(','),
			args: JSON.stringify({
				mode: modeName,
				targets: targets.map(t => `${t.id}@${t.type}`).join(','),
				commands: parsedCommands.join(',')
			}),
		};
	}
}

export default new PermissionsCommand();
