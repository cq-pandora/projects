import { Message } from 'discord.js';

import config from '../../config';

export default (message: Message): string[] => {
	const serverPermissions = config.permissions.get(message.guild?.id || '0');

	if (!serverPermissions) {
		return Object.keys(config.commands);
	}

	const { user = {}, channel = {}, role = {} } = serverPermissions;

	const userList = user[message.member?.id || '0'];
	const channelList = channel[message.channel.id];
	const rolesLists = message.member?.roles.cache.map(r => role[r.id]) || [];

	const sortedLists = [userList, channelList, ...rolesLists].filter(Boolean).sort(list => list.priority);

	if (!sortedLists.length) {
		return Object.keys(config.commands);
	}

	return sortedLists.reduce(
		(res, permission) => (permission.mode
			? permission.commands
			: res.filter(cmd => !permission.commands.includes(cmd))),
		sortedLists[0].mode
			? sortedLists[0].commands
			: Object.keys(config.commands),
	);
};
