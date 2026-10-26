import { Accessory } from '@cquest/entities';
import { accessories, extractResult } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';
import { AccessoriesEmbed } from '../embeds';

const cmdArgs = {
	name: ArgumentType.string({
		required: false,
		description: 'Accessory name. If empty, all accessories will be shown',
		default: null,
	}),
};

type Arguments = typeof cmdArgs;

export class AccessoryCommand extends BaseCommand<Arguments> {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'accessory';
	public readonly description = 'Get Total War earring and necklace info and possible options';
	public readonly protected = false;

	async run({ reply, args, initial }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		let entities: Accessory[];

		if (args.name) {
			const { results } = extractResult(accessories.searchAll(args.name));

			if (!results.length) {
				await reply('Accessory not found!');

				return {
					statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				};
			}

			entities = results;
		} else {
			entities = accessories.list();
		}

		await new AccessoriesEmbed({ initial, accessories: entities }).send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: entities.map(a => a.id).join(','),
			args: JSON.stringify({ input: args.name }),
		};
	}
}

export default new AccessoryCommand();
