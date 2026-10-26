import { championBond } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';
import { ChampionBondEmbed } from '../embeds';

const cmdArgs = {
	level: ArgumentType.number({
		required: false,
		description: 'Bond level to show stats for. If empty, milestone levels are shown',
		default: 0,
	}),
};

type Arguments = typeof cmdArgs;

export class BondCommand extends BaseCommand<Arguments> {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'bond';
	public readonly description = 'Get champion bond buff stats and bond skills';
	public readonly protected = false;

	async run({ reply, args, initial }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const level = args.level ? championBond.levels.find(l => l.level === args.level) : undefined;

		if (args.level && !level) {
			const max = championBond.levels[championBond.levels.length - 1].level;

			await reply(`Bond level should be between 1 and ${max}!`);

			return {
				statusCode: CommandResultCode.ENTITY_GRADE_NOT_FOUND,
				args: JSON.stringify(args),
			};
		}

		await new ChampionBondEmbed({ initial, bond: championBond, level }).send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			args: JSON.stringify(args),
		};
	}
}

export default new BondCommand();
