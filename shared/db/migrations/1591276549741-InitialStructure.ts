import {
	MigrationInterface, QueryRunner, Table
} from 'typeorm';

export class InitialStructure1591276549741 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'aliases',
				columns: [
					{
						name: 'alias',
						isNullable: false,
						type: 'varchar',
						length: '50',
						isPrimary: true,
					},
					{
						name: 'for',
						isNullable: false,
						type: 'varchar',
						length: '45',
					},
					{
						name: 'status',
						isNullable: true,
						type: 'boolean'
					},
					{
						name: 'context',
						isNullable: false,
						type: 'varchar',
						length: '25',
						isPrimary: true,
					},
				],
			})
		);

		await queryRunner.createTable(new Table({
			name: 'color_lists',
			columns: [
				{
					name: 'server_id',
					isNullable: false,
					type: 'varchar',
					length: '25',
					isPrimary: true,
				},
				{
					name: 'target_id',
					isNullable: false,
					type: 'varchar',
					length: '25',
					isPrimary: true,
				},
				{
					name: 'mode',
					isNullable: false,
					type: 'boolean'
				},
				{
					name: 'commands',
					isNullable: false,
					type: 'text'
				},
				{
					name: 'target_type',
					isNullable: false,
					type: 'varchar',
					length: '10',
					isPrimary: true,
				},
				{
					name: 'priority',
					isNullable: false,
					type: 'bigint'
				},
			]
		}));

		await queryRunner.createTable(
			new Table({
				name: 'stats',
				columns: [
					{
						name: 'id',
						isNullable: false,
						type: 'bigint',
						isPrimary: true,
						isGenerated: true,
						generationStrategy: 'increment',
					},
					{
						name: 'arguments',
						isNullable: true,
						type: 'text',
					},
					{
						name: 'user_id',
						isNullable: false,
						type: 'varchar',
						length: '25',
					},
					{
						name: 'channel_id',
						isNullable: false,
						type: 'varchar',
						length: '25',
					},
					{
						name: 'sent_to',
						isNullable: false,
						type: 'varchar',
						length: '10',
					},
					{
						name: 'content',
						isNullable: true,
						type: 'text',
					},
					{
						name: 'status_code',
						isNullable: false,
						type: 'bigint',
					},
					{
						name: 'command',
						isNullable: false,
						type: 'varchar',
						length: '45',
					},
					{
						name: 'server',
						isNullable: true,
						type: 'varchar',
						length: '25',
					},
					{
						name: 'target',
						isNullable: false,
						type: 'text',
					},
					{
						name: 'timestamp',
						isNullable: false,
						type: 'timestamp',
					},
				]
			})
		);

		await queryRunner.createTable(
			new Table({
				name: 'translations',
				columns: [
					{
						name: 'id',
						isNullable: false,
						type: 'bigint',
						generationStrategy: 'increment',
						isPrimary: true,
					},
					{
						name: 'key',
						isNullable: false,
						type: 'varchar',
						length: '255',
					},
					{
						name: 'text',
						isNullable: false,
						type: 'text',
					},
					{
						name: 'status',
						isNullable: true,
						type: 'boolean',
					},
					{
						name: 'version',
						isNullable: false,
						type: 'varchar',
						length: '10',
					},
					{
						name: 'locale',
						isNullable: false,
						type: 'varchar',
						length: '10'
					},
				]
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('aliases');
		await queryRunner.dropTable('color_lists');
		await queryRunner.dropTable('translations');
		await queryRunner.dropTable('stats');
	}
}
