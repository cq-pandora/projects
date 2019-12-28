import SingleHeroBasedCommand from './abstract/SingleHeroBasedCommand';
import { HeroFormsEmbed } from '../embeds';

export class HeroCommand extends SingleHeroBasedCommand {
	public readonly commandName = 'hero';
	public readonly description = 'Get hero basic information';

	constructor() {
		super(HeroFormsEmbed);
	}
}

export default new HeroCommand();
