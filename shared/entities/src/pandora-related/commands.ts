import { serialize, serializeAs } from 'cerialize';

export type Snowflake = string;

// Should be same as in discord.js
export type MessageTargetChannel = 'text' | 'dm' | 'voice' | 'group' | 'category' | 'news' | 'store' | 'unknown';

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
		content: string, statusCode: CommandResultCode, command: string, target: string | undefined | null
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
