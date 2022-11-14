import {
	Client, EmbedField, EmbedBuilder, SlashCommandBuilder,
	CommandInteractionOptionResolver, CacheType, User,
} from 'discord.js';

import { CommandResult } from '@cquest/entities';

export {
	CommandResult, CommandResultCode, PermissionTarget, PermissionMergeResult, ContextType, ContextValues
} from '@cquest/entities';

export type CommandReply = {
	// TODO make this embeds
	(embeds: [any]): Promise<void>;
	(message: string): Promise<void>;
};

export enum CommandCategory {
	BOT = 'Bot',
	DB = 'Database',
	UTIL = 'Utility',
	MISC = 'Miscellaneous',
	PROTECTED = 'Reserved',
}

export type CommandArgumentsSource = Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>;

export type CommandInfoResult = EmbedBuilder;

export type CommandInfoResultField = EmbedField;

export type Snowflake = string;

// eslint-disable-next-line import/export
export enum ArgumentType {
	BOOLEAN = 'boolean',
	STRING = 'string',
	NUMBER = 'number',
	CHOICE = 'choice',
}

// eslint-disable-next-line @typescript-eslint/no-namespace, import/export
export namespace ArgumentType {
	export function string(args: StringArgumentTypeGenerator): StringCommandArgument {
		return {
			...args,
			type: ArgumentType.STRING,
		};
	}

	export function number(args: NumberArgumentTypeGenerator): NumberCommandArgument {
		return {
			...args,
			type: ArgumentType.NUMBER,
		};
	}

	export function boolean(args: BooleanArgumentTypeGenerator): BooleanCommandArgument {
		return {
			...args,
			type: ArgumentType.BOOLEAN,
		};
	}

	export function choice(args: ChoiceArgumentTypeGenerator): ChoiceCommandArgument {
		return {
			...args,
			type: ArgumentType.CHOICE,
		};
	}
}

type ArgumentValueTypes = {
	[ArgumentType.BOOLEAN]: boolean;
	[ArgumentType.STRING]: string;
	[ArgumentType.NUMBER]: number;
	[ArgumentType.CHOICE]: string;
};

export type CommandArgument = ArgumentValueTypes[keyof ArgumentValueTypes];

export type RollChances = Record<string, number>;
export type RollGrade = Record<number, number>;

type RequiredBase<ValueType extends ArgumentType> = {
	required: true;
} | {
	required: false;
	default: ArgumentValueTypes[ValueType] | null
};

type BaseCommandArgument<ValueType extends ArgumentType> = {
	description: string;
	type: ValueType;
	hasAutocomplete?: boolean;
} & RequiredBase<ValueType>;

type BaseArgumentTypeGenerator<DefaltType extends ArgumentType> = Omit<BaseCommandArgument<any>, 'type'> & RequiredBase<DefaltType>;
type BooleanArgumentTypeGenerator = BaseArgumentTypeGenerator<ArgumentType.BOOLEAN>;
type StringArgumentTypeGenerator = BaseArgumentTypeGenerator<ArgumentType.STRING>;
type NumberArgumentTypeGenerator = BaseArgumentTypeGenerator<ArgumentType.NUMBER>;
type ChoiceArgumentTypeGenerator = BaseArgumentTypeGenerator<ArgumentType.CHOICE> & {
	choices: { [k: string]: string };
};

type BooleanCommandArgument = BaseCommandArgument<ArgumentType.BOOLEAN>;
type StringCommandArgument = BaseCommandArgument<ArgumentType.STRING>;
type NumberCommandArgument = BaseCommandArgument<ArgumentType.NUMBER>;
type ChoiceCommandArgument = BaseCommandArgument<ArgumentType.CHOICE> & {
	choices: { [k: string]: string };
};

export type CommandArguments = {
	[k: string]: BooleanCommandArgument | StringCommandArgument | NumberCommandArgument | ChoiceCommandArgument;
};

export type NoCommandArguments = {};

export type CommandArgumentValues<Arguments extends CommandArguments> = {
	[k in keyof Arguments]: ArgumentValueTypes[Arguments[k]['type']];
	// FIXME take required into account
	// Arguments[k]['required'] extends true
	// ? ArgumentValueTypes[Arguments[k]['type']]
	// : (ArgumentValueTypes[Arguments[k]['type']] | undefined);
};

export type CommandAuthor = Pick<User, 'id' | 'username' | 'tag' | 'avatarURL'>;

export type DeleteOriginalMessage = () => Promise<void>;

export type CommandPayload<Arguments extends CommandArguments> = {
	client: Client;
	args: CommandArgumentValues<Arguments>;
	reply: CommandReply;
	editReply: CommandReply;
	author: CommandAuthor;
	deleteOriginal: DeleteOriginalMessage;
};

export type AutocompleteOnly<A extends CommandArguments> = {
	[K in keyof A]-?: A['hasAutocomplete'] extends true ? K : never
};

export interface ICommand<Arguments extends CommandArguments> {
	readonly category: CommandCategory;
	readonly args: Arguments;
	readonly description: string;
	readonly commandName: string;
	readonly protected: boolean;

	slashCommand(): SlashCommandBuilder;
	// FIXME array of what?
	// FIXME name of arguments check
	autocomplete(name: any): Promise<any>;
	// autocomplete<K extends keyof AutocompleteOnly<Arguments>>(name: K): Promise<ReadonlyArray<Arguments[K]>>;
	parseArguments(source: CommandArgumentsSource): CommandArgumentValues<Arguments>;
	run(payload: CommandPayload<Arguments>): Promise<Partial<CommandResult>>;
}

export interface IPreloadScript {
	run(): Promise<void>;
	readonly errorCode: number;
}

export type InteractionRendererInput = {
	imageKey: string;
	text: string;
};
