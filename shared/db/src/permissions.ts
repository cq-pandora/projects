import { getConnection } from 'typeorm';

import { db as logger } from '@pandora/logger';
import { Snowflake, PermissionMergeResult } from '@pandora/entities';

import { Permission } from './models';

export async function set(serverId: Snowflake, toInsert: PermissionMergeResult[]): Promise<PermissionMergeResult[]> {
	try {
		const permissions = toInsert.map(
			p => Permission.create({
				serverId,
				targetType: p.targetType,
				targetId: p.targetId,
				mode: p.mode,
				commands: p.commands,
				priority: p.priority,
			})
		);

		await Permission.save(
			permissions,
			// FIXME filter duplicates
			// {
			// updateOnDuplicate: ['commands', 'mode', 'priority']
			// }
		);

		return toInsert;
	} catch (err) {
		logger.error('Error setting permissions:', toInsert);

		throw err;
	}
}

export async function clear(toClear: PermissionMergeResult[]): Promise<PermissionMergeResult[]> {
	try {
		await getConnection()
			.createQueryBuilder()
			.delete()
			.from(Permission)
			.where(toClear.map(p => ({
				serverId: p.serverId,
				targetId: p.targetId,
				targetType: p.targetType
			})))
			.execute();

		return toClear;
	} catch (err) {
		logger.error(`Error clearing permissions for ${toClear.map(p => `${p.targetId}#${p.targetType}@${p.serverId}`)}`);

		throw err;
	}
}

export async function list(serverId?: string): Promise<PermissionMergeResult[]> {
	try {
		if (serverId) {
			return await Permission
				.find({
					serverId
				});
		}

		return await Permission.find();
	} catch (err) {
		logger.error(serverId
			? `Error getting permissions for ${serverId}@server`
			: 'Error getting all permissions list');

		throw err;
	}
}
