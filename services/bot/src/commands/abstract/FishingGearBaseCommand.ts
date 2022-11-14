import { FishingGearType } from '@cquest/entities';
import { extractResult, fishingGear } from '@cquest/data-provider';

import BaseCommand from './BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments, ArgumentType
} from '../../common-types';
import { FishingGearsEmbed } from '../../embeds';
import { parseQuery, capitalizeFirstLetter } from '../../util';

const cmdArgs = {
	name: ArgumentType.string({
		required: true,
		description: 'Resource name',
	}),
};

type Arguments = typeof cmdArgs;
export default abstract class FishingGearBaseCommand extends BaseCommand<Arguments> {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName: string;
	public readonly description: string;
	public readonly protected = false;
	private readonly type: FishingGearType;

	protected constructor(name: 'bait' | 'rod' | 'float') {
		super();

		this.commandName = name;
		this.description = `Get info about ${name}`;
		this.type = `item_${name}` as FishingGearType;
	}

	async run({ reply, args }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { name } = args;
		const candidates = fishingGear.searchAll(name);
		const { results: fishingGears, locales } = extractResult(candidates.filter(b => b.result.type === this.type));

		if (!fishingGears.length) {
			await reply(`${capitalizeFirstLetter(this.commandName)} not found!`);

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				target: this.commandName,
			};
		}

		const embed = new FishingGearsEmbed({ initialMessage: undefined, gears: fishingGears, locales });

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: fishingGears.map(f => f.id).join(','),
			args: JSON.stringify({ name }),
		};
	}
}
