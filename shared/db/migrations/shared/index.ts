export function env(key: string): string | undefined {
	return process.env[`PANDORA_DB_${key}`];
}

export const ENV_KEYS = {
	type: 'DIALECT',
	host: 'HOST',
	port: 'PORT',
	username: 'USER',
	password: 'PASSWORD',
	database: 'DATABASE',
	schema: 'SCHEMA'
};
