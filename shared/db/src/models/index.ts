import { createConnection, Logger as ORMLogger } from 'typeorm';

import { db } from '@pandora/logger';

import Alias from './Alias';
import Permission from './Permission';
import Stats from './Stats';
import Translation from './Translation';

class TypeORMLogger implements ORMLogger {
	log(level: 'log' | 'info' | 'warn', message: any): any {
		db.log(level, message);
	}

	logMigration(message: string): any {
		this.log('info', message);
	}

	logQuery(query: string): any {
		this.log('info', `Running ${query}`);
	}

	logQueryError(error: string, query: string, parameters?: any[]): any {
		const params = parameters ? `with params (${parameters?.join(', ')})` : 'without params';

		db.error(`Error executing ${query} ${params}`, error);
	}

	logQuerySlow(time: number, query: string, parameters?: any[]): any {
		const params = parameters ? `with params (${parameters?.join(', ')})` : 'without params';

		db.warn(`Too slow query (${time}): ${query} ${params}`);
	}

	logSchemaBuild(message: string): any {
		db.info(`Schema built: ${message}`);
	}
}

export interface IDBInitOptions {
	host: string;
	port: number;
	database: string;
	username: string;
	password: string;
	schema: string;
}

export async function init(options: IDBInitOptions): Promise<void> {
	await createConnection({
		type: 'postgres',
		host: options.host,
		port: options.port,
		database: options.database,
		username: options.username,
		password: options.password,
		schema: options.database,
		logger: new TypeORMLogger(),
		entities: [Alias, Translation, Stats, Permission],
	});
}

export { default as Alias } from './Alias';
export { default as Permission } from './Permission';
export { default as Stats } from './Stats';
export { default as Translation } from './Translation';
