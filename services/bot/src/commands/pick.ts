import { random } from '../util';

import BaseCommand from './abstract/BaseCommand';

import {
	entityCollections, entityCollectionNames, EntityCollectionName, IEntityCollection,
} from '../embeds/entity-embeds';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';

const cmdArgs = {
	collection: ArgumentType.choice({
		choices: entityCollectionNames.reduce((r, v) => ({
			...r,
			[v.replace('-', ' ')]: v
		}), {}),
		required: true,
		description: 'Collection to pick from',
	}),
};

type Arguments = typeof cmdArgs;

export class PickCommand extends BaseCommand<Arguments> {
	readonly args = cmdArgs;
	readonly argsOrderMatters = false;
	readonly category = CommandCategory.MISC;
	readonly commandName = 'pick';
	readonly description = 'Pick random entity from specified collection';
	readonly protected = false;

	private collections?: Record<EntityCollectionName, IEntityCollection>;

	async run({ args, reply, initial }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const { collection } = args;

		if (this.collections === undefined) {
			this.collections = entityCollections();
		}

		if (!(collection in this.collections)) {
			await reply('Collection not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				target: 'collection'
			};
		}

		const entities = this.collections[collection as EntityCollectionName];

		await entities.embed(initial, random(0, entities.size - 1)).send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: 'pick',
			args: JSON.stringify({ collection }),
		};
	}
}

export default new PickCommand();
