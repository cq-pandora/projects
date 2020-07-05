type Snowflake = string;

function stringTuple<T extends [string] | string[]>(...data: T): T {
	return data;
}

export const ContextValues = stringTuple(
	'heroes', 'champions', 'sp', 'bosses', 'breads', 'berries', 'sigils',
	'commands', 'goddesses', 'factions', 'fishes', 'fish-gear', 'fish-ponds',
	'portraits', 'scarecrows'
);

export type ContextType = typeof ContextValues[number];

export type PermissionTarget = 'user' | 'channel' | 'role';

export type PermissionMergeResult = {
	serverId: Snowflake;
	targetType: PermissionTarget;
	targetId: Snowflake;
	commands: Array<string>;
	mode: 0 | 1;
	priority: number;
};
