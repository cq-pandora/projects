import { heroes, extractResult } from '@cquest/data-provider';

import BaseCommand from './abstract/BaseCommand';

import {
	CommandCategory, CommandResult, CommandPayload, CommandResultCode, ArgumentType
} from '../common-types';
import { HeroProfileEmbed } from '../embeds';

const cmdArgs = {
	name: ArgumentType.string({
		required: true,
		description: 'Hero name',
	}),
};

type Arguments = typeof cmdArgs;

export class ProfileCommand extends BaseCommand<Arguments> {
	public readonly args = cmdArgs;
	public readonly argsOrderMatters = false;
	public readonly category = CommandCategory.DB;
	public readonly commandName = 'profile';
	public readonly description = 'Get hero profile: age, birthday, hobby, likes and hates';
	public readonly protected = false;

	async run({ reply, args, initial }: CommandPayload<Arguments>): Promise<Partial<CommandResult>> {
		const result = heroes.search(args.name);

		if (!result) {
			await reply('Hero not found!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
			};
		}

		const { result: hero, locales } = extractResult(result);

		if (!hero.profile) {
			await reply('Hero has no profile!');

			return {
				statusCode: CommandResultCode.ENTITY_NOT_FOUND,
				target: hero.id,
			};
		}

		await new HeroProfileEmbed({ initial, hero, locales }).send();

		return {
			statusCode: CommandResultCode.SUCCESS,
			target: hero.id,
			args: JSON.stringify(args),
		};
	}
}

export default new ProfileCommand();
