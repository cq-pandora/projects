import {
	BaseEntity, Entity, PrimaryGeneratedColumn, Column
} from 'typeorm';

import {
	Snowflake, CommandResult, MessageTargetChannel, CommandResultCode
} from '@pandora/entities';

@Entity('stats')
export default class Stats extends BaseEntity implements CommandResult {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ name: 'arguments', nullable: true })
	args!: string;

	@Column({ name: 'user_id', nullable: false })
	userId!: Snowflake;

	@Column({ name: 'channel_id', nullable: false })
	channelId!: Snowflake;

	@Column({ name: 'sent_to', nullable: false })
	sentTo!: MessageTargetChannel;

	@Column({ nullable: false })
	content!: string;

	@Column({ name: 'status_code', nullable: false })
	statusCode!: CommandResultCode;

	@Column({ nullable: false })
	command!: string;

	@Column({ nullable: true })
	server!: Snowflake;

	@Column({ nullable: true, type: 'text' })
	target!: string | null;

	@Column({ nullable: true })
	timestamp!: Date;
}
