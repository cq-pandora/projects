import {
	Column, Model, DataType, BeforeCreate, BeforeUpdate, Table, PrimaryKey, AllowNull
} from 'sequelize-typescript';

import { Snowflake, PermissionTarget, PermissionMergeResult } from '../../common-types';

@Table({
	tableName: 'color_lists',
	timestamps: false
})
export default class Permission extends Model<Permission> implements PermissionMergeResult {
	@AllowNull(false)
	@Column({
		type: DataType.STRING,
		field: 'commands',
	})
	private commandsInternal!: string;

	@AllowNull(false)
	@Column({
		type: DataType.BOOLEAN,
		field: 'mode'
	})
	private modeInternal!: boolean;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	priority!: number;

	@PrimaryKey
	@AllowNull(false)
	@Column({
		type: DataType.STRING,
		field: 'server_id',
	})
	serverId!: Snowflake;

	@PrimaryKey
	@AllowNull(false)
	@Column({
		type: DataType.STRING,
		field: 'target_id',
	})
	targetId!: Snowflake;

	@PrimaryKey
	@AllowNull(false)
	@Column({
		type: DataType.STRING,
		field: 'target_type',
	})
	targetType!: PermissionTarget;

	commands!: string[];
	mode!: 1 | 0;

	@BeforeCreate
	static splitCommands(instance: Permission): void {
		instance.commands = instance.commandsInternal.split(',');
		instance.mode = instance.modeInternal ? 1 : 0;
	}

	@BeforeUpdate
	static joinCommands(instance: Permission): void {
		instance.commandsInternal = instance.commands.join(',');
		instance.modeInternal = Boolean(instance.mode);
	}
}
