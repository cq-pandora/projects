import SingleHeroBasedCommand from './abstract/SingleHeroBasedCommand';
import { HeroSBWBlockEmbed } from '../embeds';

export class SBWBlockCommand extends SingleHeroBasedCommand {
	public readonly commandName = 'sbw-block';
	public readonly description = 'Get hero block and soulbound weapon info';

	constructor() {
		super(HeroSBWBlockEmbed, true);
	}
}

export default new SBWBlockCommand();
