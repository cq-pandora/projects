import prefixedEnv from '../util/functions/prefixedEnv';

export default class DBConfig {
	public readonly user: string;
	public readonly password: string;
	public readonly host: string;
	public readonly port?: string;
	public readonly database: string;
	public readonly schema: string;

	constructor(prefix: string) {
		this.user = prefixedEnv('USER', prefix);
		this.password = prefixedEnv('PASSWORD', prefix);
		this.host = prefixedEnv('HOST', prefix);
		this.port = prefixedEnv('PORT', prefix);
		this.database = prefixedEnv('DATABASE', prefix);
		this.schema = prefixedEnv('SCHEMA', prefix);
	}
}
