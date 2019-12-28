import SingleHeroBasedCommand from './abstract/SingleHeroBasedCommand';
import { HeroSBWEmbed } from '../embeds';

export class SBWCommand extends SingleHeroBasedCommand {
	public readonly commandName = 'sbw';
	public readonly description = 'Get hero soulbound weapon description';

	constructor() {
		super(HeroSBWEmbed, true);
	}
}

export default new SBWCommand();
