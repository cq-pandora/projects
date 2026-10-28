import { Hero, HeroForm } from '@cquest/entities';

import SingleHeroBasedCommand from './abstract/SingleHeroBasedCommand';
import { HeroSBWEmbed } from '../embeds';

export class SBWCommand extends SingleHeroBasedCommand {
	public readonly commandName = 'sbw';
	public readonly description = 'Get hero soulbound weapon description';
	public readonly aliases = ['s'];

	constructor() {
		super(HeroSBWEmbed);
	}

	protected missingDataReply(hero: Hero): string | undefined {
		return hero.sbws.length ? undefined : 'Soulbound weapon not found for hero!';
	}

	// The embed pages over soulbound weapons (4-6★ only), not over hero forms
	protected pageOf(hero: Hero, form: HeroForm): number | undefined {
		const index = hero.sbws.findIndex(sbw => sbw.star === form.star);

		return index === -1 ? undefined : index + 1;
	}
}

export default new SBWCommand();
