import { IPreloadScript } from '../common-types';

import getCQVersion from './00-get-cq-version';
import loadTranslations from './01-load-translations-from-db';
import loadAliases from './02-load-aliases-from-db';
import loadCommands from './03-load-commands';
import loadPermissions from './04-load-permissions';

const scripts: IPreloadScript[] = [
	getCQVersion,
	loadTranslations,
	loadAliases,
	loadCommands,
	loadPermissions,
];

export default scripts;
