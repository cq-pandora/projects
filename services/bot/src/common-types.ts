import {
	Client, Message, EmbedField, MessageEmbedOptions
} from 'discord.js';
import { serialize, serializeAs } from 'cerialize';

export enum CommandCategory {
	BOT = 'Bot',
	DB = 'Database',
	UTIL = 'Utility',
	MISC = 'Miscellaneous',
	PROTECTED = 'Reserved',
}

export enum CommandResultCode {
	FATAL = -1,
	SUCCESS = 0,
	NOT_ENOUGH_ARGS = 1,
	NOT_ENOUGH_PERMISSIONS = 2,
	ENTITY_NOT_FOUND = 3,
	ENTITY_GRADE_NOT_FOUND = 4,
	UNKNOWN_ERROR = 5,
	SUBENTITY_NOT_FOUND = 6,
	WRONG_CHANNEL_TYPE = 7,
}

export type CommandPayload = {
	client: Client;
	message: Message;
	args: ReadonlyArray<string>;
};

export class CommandResult {
	@serializeAs('arguments') public args: string;
	@serializeAs('user_id') public userId: Snowflake;
	@serializeAs('channel_id') public channelId: Snowflake;
	@serialize public server: Snowflake;
	@serializeAs('sent_to') public sentTo: MessageTargetChannel;
	@serialize public content: string;
	@serializeAs('status_code') public statusCode: CommandResultCode;
	@serialize public command: string;
	@serialize public target?: string | null;

	constructor(
		args: string, userId: Snowflake, channelId: Snowflake, server: Snowflake, sentTo: MessageTargetChannel,
		content: string, statusCode: CommandResultCode, command: string, target: string | null | undefined
	) {
		this.args = args;
		this.userId = userId;
		this.channelId = channelId;
		this.server = server;
		this.sentTo = sentTo;
		this.content = content;
		this.statusCode = statusCode;
		this.command = command;
		this.target = target;
	}
}

export type CommandInfoResult = MessageEmbedOptions;

export type CommandInfoResultField = EmbedField;

export type Snowflake = string;

// Declared via discord.js globally
// eslint-disable-next-line no-undef
export type MessageTargetChannel = keyof typeof ChannelType;

export type CommandArguments = {
	[k: string]: {
		required: boolean;
		description: string;
	};
};

function stringTuple<T extends [string] | string[]>(...data: T): T {
	return data;
}

export const ContextValues = stringTuple(
	'heroes', 'champions', 'sp', 'bosses', 'breads', 'berries', 'sigils',
	'commands', 'goddesses', 'factions', 'fishes', 'fish-gear', 'fish-ponds',
	'portraits'
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

export type RollChances = Record<string, number>;
export type RollGrade = Record<number, number>;

export type MentionType = 'user' | 'channel' | 'role' | 'emoji';

export type ExtractedMentions = {
	type: MentionType;
	id: Snowflake;
	text: string;
};

export interface ICommand {
	readonly category: CommandCategory;
	readonly args: CommandArguments;
	readonly argsOrderMatters: boolean;
	readonly description: string;
	readonly commandName: string;
	readonly protected: boolean;

	run(payload: CommandPayload): Promise<Partial<CommandResult>>;
	instructions({ message }: CommandPayload): Promise<CommandInfoResult>;
}

export interface IPreloadScript {
	run(): Promise<void>;
	readonly errorCode: number;
}

export type InteractionRendererInput = {
	imageKey: string;
	text: string;
};
