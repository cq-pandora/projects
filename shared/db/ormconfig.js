function env(key) { return process.env(`PANDORA_DB_${key}`); }

module.exports = {
	type: 'postgres',
	host: env('HOST'),
	port: env('PORT') || 5432,
	username: env('USER'),
	password: env('PASSWORD'),
	database: env('DATABASE'),
	migrationsTableName: 'typeorm_migrations',
	migrations: ['migrations/*.js'],
	cli: {
		migrationsDir: 'migrations',
	}
}
