import { DataSource } from 'typeorm';

import { env, ENV_KEYS } from './migrations/shared';

export const connectionSource = new DataSource({
	type: 'postgres',
	host: env(ENV_KEYS.host),
	port: parseInt(env(ENV_KEYS.port) ?? '5432', 10),
	username: env(ENV_KEYS.username),
	password: env(ENV_KEYS.password),
	database: env(ENV_KEYS.database),
	schema: env(ENV_KEYS.schema),
	migrationsTableName: 'typeorm_migrations',
	migrations: ['migrations/*.ts'],
	// Compiled entities: tsx (esbuild) does not emit decorator metadata the models rely on, run `yarn build` first
	entities: ['lib/models/*.js'],
});
