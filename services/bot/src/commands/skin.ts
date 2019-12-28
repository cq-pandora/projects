import SingleHeroBasedCommand from './abstract/SingleHeroBasedCommand';
import { HeroSkinsEmbed } from '../embeds';

export class SBWBlockCommand extends SingleHeroBasedCommand {
	public readonly commandName = 'skin';
	public readonly description = 'Get hero skin info and stats';

	constructor() {
		super(HeroSkinsEmbed, false, false);
	}
}

export default new SBWBlockCommand();
