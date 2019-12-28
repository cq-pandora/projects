import SingleHeroBasedCommand from './abstract/SingleHeroBasedCommand';
import { HeroBlockEmbed } from '../embeds';

export class BlockCommand extends SingleHeroBasedCommand {
	public readonly commandName = 'block';
	public readonly description = 'Get hero block description';

	constructor() {
		super(HeroBlockEmbed);
	}
}

export default new BlockCommand();
