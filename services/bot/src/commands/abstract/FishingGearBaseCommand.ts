import { FishingGearType } from '@pandora/entities';

import BaseCommand from './BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, CommandArguments
} from '../../common-types';
import { FishingGearsEmbed } from '../../embeds';
import { parseQuery, capitalizeFirstLetter } from '../../util';
import { extractResult, fishingGear } from '../../cq-data';

export default abstract class FishingGearBaseCommand extends BaseCommand {
	public readonly args: CommandArguments;
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
		this.args = {
			name: {
				required: true,
				description: `${capitalizeFirstLetter(name)} name`,
			},
		};
		this.type = `item_${name}` as FishingGearType;
	}

	async run(payload: CommandPayload): Promise<Partial<CommandResult>> {
		const { message, args } = payload;

		if (!args.length) {
			const embed = this.instructions(payload);

			await message.channel.send({ embed });

			return {
				statusCode: CommandResultCode.NOT_ENOUGH_ARGS,
			};
		}

		const name = parseQuery(args);

		const candidates = fishingGear.searchAll(name);
		const { results: fishingGears, locales } = extractResult(candidates.filter(b => b.result.type === this.type));

		if (!fishingGears.length) {
			await message.channel.send(`${capitalizeFirstLetter(this.commandName)} not found!`);

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				target: this.commandName,
			};
		}

		const embed = new FishingGearsEmbed({ initialMessage: message, gears: fishingGears, locales });

		await embed.send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: fishingGears.map(f => f.id).join(','),
			args: JSON.stringify({ name }),
		};
	}
}
