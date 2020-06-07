import {
	BaseEntity, Entity, PrimaryColumn, Column, BeforeUpdate, AfterLoad
} from 'typeorm';

import { Snowflake, PermissionTarget, PermissionMergeResult } from '@cquest/entities';

@Entity('color_lists')
export default class Permission extends BaseEntity implements PermissionMergeResult {
	@PrimaryColumn({
		nullable: false,
		name: 'server_id',
	})
	serverId!: Snowflake;

	@PrimaryColumn({
		nullable: false,
		name: 'target_id',
	})
	targetId!: Snowflake;

	@PrimaryColumn({
		nullable: false,
		name: 'target_type',
	})
	targetType!: PermissionTarget;

	@Column({
		name: 'commands',
		nullable: false
	})
	private commandsInternal!: string;

	@Column(
		'boolean',
		{
			name: 'mode',
			nullable: false,
		}
	)
	private modeInternal!: boolean;

	@Column({
		nullable: false
	})
	priority!: number;

	commands!: string[];
	mode!: 1 | 0;

	@AfterLoad()
	splitCommands(): void {
		this.commands = this.commandsInternal.split(',');
		this.mode = this.modeInternal ? 1 : 0;
	}

	@BeforeUpdate()
	joinCommands(): void {
		this.commandsInternal = this.commands.join(',');
		this.modeInternal = Boolean(this.mode);
	}
}
