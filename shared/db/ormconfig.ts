import { env, ENV_KEYS } from './migrations/shared';

export = {
	type: env(ENV_KEYS.type) ?? 'postgres',
	host: env(ENV_KEYS.host),
	port: env(ENV_KEYS.port) ?? 5432,
	username: env(ENV_KEYS.username),
	password: env(ENV_KEYS.password),
	database: env(ENV_KEYS.database),
	schema: env(ENV_KEYS.schema),
	migrationsTableName: 'typeorm_migrations',
	migrations: ['migrations/*.ts'],
	cli: {
		migrationsDir: 'migrations',
		entitiesDir: 'src/models'
	}
};
