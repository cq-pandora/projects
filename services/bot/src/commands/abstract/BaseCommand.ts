import { RESTPostAPIApplicationCommandsJSONBody, SlashCommandBuilder } from 'discord.js';

import {
	CommandCategory, CommandPayload, CommandResult, CommandArguments, ICommand,
	CommandArgumentsSource, ArgumentType, CommandArgumentValues, AutocompleteOnly,
} from '../../common-types';

export default abstract class BaseCommand<A extends CommandArguments> implements ICommand<A> {
	public abstract readonly category: CommandCategory;
	public abstract readonly args: A;
	public abstract readonly description: string;
	public abstract readonly commandName: string;
	public abstract readonly protected: boolean;
	public readonly aliases: string[] = [];

	abstract run(payload: CommandPayload<A>): Promise<Partial<CommandResult>>;

	autocomplete<K extends keyof AutocompleteOnly<A>>(name: K): Promise<ReadonlyArray<A[K]>> {
		throw Error(`Command ${this.commandName} did not set-up autocompletion for field ${String(name)}`);
	}

	parseArguments(source: CommandArgumentsSource): CommandArgumentValues<A> {
		const result = {} as Record<string, any>;

		for (const key of Object.keys(this.args)) {
			// TODO may be some kind of typechecks
			const argDefinition = this.args[key];

			if (argDefinition.required) {
				result[key] = source.get(key, true).value;
			} else {
				result[key] = source.get(key)?.value || argDefinition.default;
			}

			// eslint-disable-next-line default-case
			switch (argDefinition.type) {
				case ArgumentType.BOOLEAN:
					result[key] = result[key] === 'true';
					break;
				case ArgumentType.NUMBER:
					result[key] = parseInt(result[key], 10);
					break;
			}
		}

		return result as CommandArgumentValues<A>;
	}

	slashCommandJSON(): RESTPostAPIApplicationCommandsJSONBody[] {
		const cmds: RESTPostAPIApplicationCommandsJSONBody[] = [];

		const cmd = new SlashCommandBuilder()
			.setName(this.commandName)
			.setDescription(this.description);

		for (const [name, arg] of Object.entries(this.args)) {
			const { required, description, type } = arg;
			switch (type) {
				case ArgumentType.BOOLEAN:
					cmd.addBooleanOption(
						option => option.setName(name)
							.setDescription(description)
							.setRequired(required)
					);
					break;
				case ArgumentType.STRING:
					cmd.addStringOption(
						option => option.setName(name)
							.setDescription(description)
							.setRequired(required)
					);
					break;
				case ArgumentType.NUMBER:
					cmd.addNumberOption(
						option => option.setName(name)
							.setDescription(description)
							.setRequired(required)
					);
					break;
				case ArgumentType.CHOICE:
					cmd.addStringOption(
						option => option.setName(name)
							.setDescription(description)
							.setChoices(...Object.entries(arg.choices).map(([k, v]) => ({ name: k, value: String(v) })))
							.setRequired(required)
					);
					break;
				default:
					throw new Error(`Bad argument type: ${type}`);
			}
		}

		cmds.push(cmd.toJSON());

		for (const alias of this.aliases) {
			cmds.push(cmd.setName(alias).toJSON());
		}

		return cmds;
	}
}
