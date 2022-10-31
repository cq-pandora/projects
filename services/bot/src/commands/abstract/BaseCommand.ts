import { SlashCommandBuilder } from 'discord.js';

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
	public argsOrderMatters = false;

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
				result[key] = source.get(key, true);
			} else {
				result[key] = source.get(key) || argDefinition.default;
			}
		}

		return result as CommandArgumentValues<A>;
	}

	slashCommand(): SlashCommandBuilder {
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

		return cmd;
	}
}
