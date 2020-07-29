import { IPreloadScript } from '../common-types';

import getCQVersion from './get-cq-version';
import loadTranslations from './load-translations-from-db';
import loadAliases from './load-aliases-from-db';
import loadCommands from './load-commands';
import loadPermissions from './load-permissions';
import initDB from './init-db';
import initData from './init-data';

const scripts: IPreloadScript[] = [
	getCQVersion,
	initDB,
	loadAliases,
	initData,
	loadTranslations,
	loadCommands,
	loadPermissions,
];

export default scripts;
