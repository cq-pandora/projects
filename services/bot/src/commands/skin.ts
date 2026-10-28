import { Hero } from '@cquest/entities';

import SingleHeroBasedCommand from './abstract/SingleHeroBasedCommand';
import { HeroSkinsEmbed } from '../embeds';

export class SkinCommand extends SingleHeroBasedCommand {
	public readonly commandName = 'skin';
	public readonly description = 'Get hero skin info and stats';

	constructor() {
		super(HeroSkinsEmbed, false);
	}

	protected missingDataReply(hero: Hero): string | undefined {
		return hero.skins.length ? undefined : 'Hero has no skins!';
	}
}

export default new SkinCommand();
