import { MessageEmbed, Message } from 'discord.js';
import { Hero, HeroClassColors } from '@pandora/entities';

import PaginationEmbed from './PaginationEmbed';
import { imageUrl, statsToString } from '../util/functions';
import { translate } from '../cq-data';
import config from '../config';

export default class HeroSkinsEmbed extends PaginationEmbed {
	constructor(initialMessage: Message, hero: Hero) {
		super(initialMessage);

		const embeds = hero.skins.map(skin => (
			new MessageEmbed()
				.setTitle(translate(skin.name))
				.setDescription(statsToString(skin.stats))
				.setThumbnail(imageUrl(`heroes/${skin.image}`))
				.addField('Sell price', `${skin.cost}${config.emojis.gold}`, true)
		));

		this.setArray(embeds)
			.showPageIndicator(false)
			.setColor(HeroClassColors[hero.clazz]);
	}
}
