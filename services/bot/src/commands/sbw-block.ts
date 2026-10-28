import { Hero } from '@cquest/entities';

import SingleHeroBasedCommand from './abstract/SingleHeroBasedCommand';
import { HeroSBWBlockEmbed } from '../embeds';

export class SBWBlockCommand extends SingleHeroBasedCommand {
	public readonly commandName = 'sbw-block';
	public readonly description = 'Get hero block and soulbound weapon info';
	public readonly aliases = ['sb'];

	constructor() {
		super(HeroSBWBlockEmbed);
	}

	protected missingDataReply(hero: Hero): string | undefined {
		return hero.sbws.length ? undefined : 'Soulbound weapon not found for hero!';
	}
}

export default new SBWBlockCommand();
