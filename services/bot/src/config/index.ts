import { Deserialize } from 'cerialize';

import prefixedEnv from '../util/functions/prefixedEnv';
import loadRootConfig from '../util/functions/loadRootConfig';

import {
	Snowflake, PermissionMergeResult, PermissionTarget, ICommand, CommandArguments
} from '../common-types';

import AliasesConfig from './AliasesConfig';
import DBConfig from './DBConfig';
import EmojisConfig from './EmojisConfig';
import PackageConfig from './PackageConfig';
import LinksField from './LinksField';

type Commands = {
	[commandName: string]: ICommand<CommandArguments>;
};

class Config {
	public readonly token: string;
	public readonly appId: string;
	public readonly prefix: string;
	public readonly parsedData: string;
	public readonly localImagePrefix: string;
	public readonly imagePrefix: string;
	public readonly imageSuffix: string;
	public readonly ownerId: string;
	public readonly db: DBConfig;
	public readonly emojis: EmojisConfig;
	public readonly package: PackageConfig;
	public readonly aliases: AliasesConfig;
	public readonly links: LinksField[];
	public readonly commands: Commands;
	public readonly overridesPath: string;
	public gameVersion = 'UNKNOWN';

	constructor() {
		const prefix = 'PANDORA_';

		this.token = prefixedEnv('TOKEN', prefix);
		this.appId = prefixedEnv('APPLICATION_ID', prefix);
		this.prefix = prefixedEnv('PREFIX', prefix);
		this.parsedData = prefixedEnv('CQ_NORMALIZED_DATA_PATH', prefix);
		this.localImagePrefix = prefixedEnv('LOCAL_IMAGES_PREFIX', prefix);
		this.imagePrefix = prefixedEnv('URL_IMAGES_PREFIX', prefix);
		this.imageSuffix = prefixedEnv('IMAGES_SUFFIX', prefix);
		this.ownerId = prefixedEnv('OWNER_ID', prefix);

		this.overridesPath = prefixedEnv('OVERRIDES_PATH', prefix);

		this.emojis = Deserialize(JSON.parse(loadRootConfig('emojis.json', this.overridesPath)), EmojisConfig);
		this.package = Deserialize(JSON.parse(loadRootConfig('package.json', this.overridesPath)), PackageConfig);
		this.links = Deserialize(JSON.parse(loadRootConfig('links.json', this.overridesPath)), LinksField);

		this.db = new DBConfig(`${prefix}DB_`);
		this.aliases = new AliasesConfig();

		this.commands = {};
	}
}

export default new Config();
