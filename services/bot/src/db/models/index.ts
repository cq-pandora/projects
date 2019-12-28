import { Sequelize } from 'sequelize-typescript';
import { Logger } from 'winston';

import config from '../../config';
import { db } from '../../logger';

import Alias from './Alias';
import Permission from './Permission';
import Stats from './Stats';
import Translation from './Translation';

const sequelize = new Sequelize({
	dialect: 'mysql',
	host: config.db.host,
	port: Number(config.db.port),
	database: config.db.database,
	username: config.db.user,
	password: config.db.password,
	models: [Alias, Permission, Stats, Translation],
	logging: (sql): Logger => db.verbose(sql),
});

export default sequelize;

export { default as Alias } from './Alias';
export { default as Permission } from './Permission';
export { default as Stats } from './Stats';
export { default as Translation } from './Translation';
