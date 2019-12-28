import {
	Column, Model, DataType, Table, PrimaryKey, AutoIncrement, AllowNull
} from 'sequelize-typescript';

import {
	Snowflake, CommandResult, MessageTargetChannel, CommandResultCode
} from '../../common-types';

@Table({
	tableName: 'stats',
	timestamps: false
})
export default class Stats extends Model<Stats> implements CommandResult {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	id!: number;

	@AllowNull(true)
	@Column({
		type: DataType.STRING,
		field: 'arguments',
	})
	args!: string;

	@AllowNull(false)
	@Column({
		type: DataType.STRING,
		field: 'user_id',
	})
	userId!: Snowflake;

	@AllowNull(false)
	@Column({
		type: DataType.STRING,
		field: 'channel_id',
	})
	channelId!: Snowflake;

	@AllowNull(false)
	@Column({
		type: DataType.STRING,
		field: 'sent_to',
	})
	sentTo!: MessageTargetChannel;

	@AllowNull(false)
	@Column(DataType.STRING)
	content!: string;

	@Column({
		type: DataType.TINYINT,
		field: 'status_code',
	})
	statusCode!: CommandResultCode;

	@AllowNull(false)
	@Column(DataType.STRING)
	command!: string;

	@AllowNull(true)
	@Column(DataType.STRING)
	server!: Snowflake;

	@AllowNull(true)
	@Column(DataType.STRING)
	target!: string;

	@AllowNull(true)
	@Column(DataType.DATE)
	timestamp!: Date;
}
