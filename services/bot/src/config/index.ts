import { Deserialize } from 'cerialize';

import prefixedEnv from '../util/functions/prefixedEnv';
import loadRootConfig from '../util/functions/loadRootConfig';

import {
	Snowflake, PermissionMergeResult, PermissionTarget, ICommand
} from '../common-types';

import AliasesConfig from './AliasesConfig';
import DBConfig from './DBConfig';
import EmojisConfig from './EmojisConfig';
import PackageConfig from './PackageConfig';
import LinksField from './LinksField';

type ServerPermission = {
	[target in PermissionTarget]: {
		[targetId in Snowflake]: Permission;
	}
};

type ServerPermissions = Record<Snowflake, ServerPermission>;

const DefaultPermissionsPriorities: {
	[target in PermissionTarget]: number
} = {
	user: 3,
	channel: 2,
	role: 1,
};

type Permission = {
	mode: 0 | 1;
	commands: Array<string>;
	priority: number;
};

class PermissionsConfig {
	private permissions: ServerPermissions = {};
	private config: Config;

	constructor(config: Config) {
		this.config = config;
	}

	get(serverId: Snowflake): ServerPermission {
		return this.permissions[serverId];
	}

	set(
		serverId: Snowflake, targetType: PermissionTarget, targetId: Snowflake, mode: 0 | 1, commands: string[],
		priority?: number
	): void {
		const serverPermissions = this.permissions[serverId] = this.permissions[serverId] || {};
		const targetPermissions = serverPermissions[targetType] = serverPermissions[targetType] || {};

		targetPermissions[targetId] = {
			mode,
			commands,
			priority: priority || DefaultPermissionsPriorities[targetType]
		};
	}

	merge(
		serverId: Snowflake, targetType: PermissionTarget, targetId: Snowflake, mode: number, rawCommands: string[],
		priority?: number
	): PermissionMergeResult {
		if (!rawCommands.length) {
			return {
				serverId,
				targetType,
				targetId,
				commands: [],
				mode: 0,
				priority: -1,
			};
		}

		const commandNames = Object.keys(this.config.commands);
		const commands = rawCommands.filter(c => commandNames.includes(c));

		const serverPermissions = this.permissions[serverId] || {};
		const targetPermissions = serverPermissions[targetType] || {};

		const {
			mode: currentMode = 0,
			commands: currentCommands = [],
			priority: currentPriority = DefaultPermissionsPriorities[targetType],
		} = targetPermissions[targetId] || {};

		const result: PermissionMergeResult = {
			commands: [],
			mode: 0,
			priority: 0,
			serverId,
			targetId,
			targetType,
		};

		if (currentMode === mode) {
			result.mode = mode;
			result.priority = priority || currentPriority;
			result.commands = [...new Set(currentCommands.concat(commands))];
		} else if (mode < 0) {
			result.mode = currentMode;
			result.priority = currentPriority;
			result.commands = currentCommands.filter(c => commands.includes(c));
		} else {
			result.mode = +Boolean(mode) as 0 | 1;
			result.priority = priority || currentPriority;
			result.commands = commands;
		}

		return result;
	}
}

type Commands = {
	[commandName: string]: ICommand;
};

class Config {
	public readonly token: string;
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
	public readonly permissions: PermissionsConfig;
	public readonly links: LinksField[];
	public readonly commands: Commands;
	public readonly overridesPath: string;
	public gameVersion = 'UNKNOWN';

	constructor() {
		const prefix = 'PANDORA_';

		this.token = prefixedEnv('TOKEN', prefix);
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
		this.permissions = new PermissionsConfig(this);

		this.commands = {};
	}
}

export default new Config();
