import {
	Client, Message, EmbedField, MessageEmbedOptions
} from 'discord.js';

import { CommandResult } from '@pandora/entities';

export {
	CommandResult, CommandResultCode, PermissionTarget, PermissionMergeResult, ContextType, ContextValues
} from '@pandora/entities';

export type CommandPayload = {
	client: Client;
	message: Message;
	args: ReadonlyArray<string>;
};

export enum CommandCategory {
	BOT = 'Bot',
	DB = 'Database',
	UTIL = 'Utility',
	MISC = 'Miscellaneous',
	PROTECTED = 'Reserved',
}

export type CommandInfoResult = MessageEmbedOptions;

export type CommandInfoResultField = EmbedField;

export type Snowflake = string;

export type CommandArguments = {
	[k: string]: {
		required: boolean;
		description: string;
	};
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
