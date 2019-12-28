import { Op } from 'sequelize';

import { Permission } from './models';

import config from '../config';
import { db as logger } from '../logger';
import { Snowflake, PermissionMergeResult } from '../common-types';

export async function set(serverId: Snowflake, toInsert: Array<PermissionMergeResult>): Promise<void> {
	try {
		const permissions = toInsert.map(
			p => new Permission({
				serverId,
				targetType: p.targetType,
				targetId: p.targetId,
				mode: p.mode,
				commands: p.commands,
				priority: p.priority,
			})
		);

		await Permission.bulkCreate(
			permissions,
			{
				updateOnDuplicate: ['commands', 'mode', 'priority']
			}
		);

		toInsert.map(p => config.permissions.set(serverId, p.targetType, p.targetId, p.mode, p.commands, p.priority));
	} catch (err) {
		logger.error('Error setting permissions:', toInsert);

		throw err;
	}
}

export async function clear(toClear: Array<PermissionMergeResult>): Promise<void> {
	try {
		await Permission
			.destroy({
				where: {
					[Op.or]: toClear.map(p => ({
						serverId: p.serverId,
						targetId: p.targetId,
						targetType: p.targetType
					}))
				}
			});

		toClear.map(p => config.permissions.set(p.serverId, p.targetType, p.targetId, 0, []));
	} catch (err) {
		logger.error(`Error clearing permissions for ${toClear.map(p => `${p.targetId}#${p.targetType}@${p.serverId}`)}`);

		throw err;
	}
}

export async function list(serverId?: string): Promise<PermissionMergeResult[]> {
	try {
		if (serverId) {
			return await Permission
				.findAll({
					where: { serverId }
				});
		}

		return await Permission.findAll();
	} catch (err) {
		logger.error(serverId
			? `Error getting permissions for ${serverId}@server`
			: 'Error getting all permissions list');

		throw err;
	}
}
