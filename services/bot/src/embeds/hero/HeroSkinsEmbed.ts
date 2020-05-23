import { HeroClassColors } from '@pandora/entities';

import { imageUrl, statsToString } from '../../util/functions';
import config from '../../config';

import PaginationEmbed from '../PaginationEmbed';
import { l, LocalizableMessageEmbed } from '../LocalizableMessageEmbed';

import IHeroEmbedConstructorOptions from './IHeroEmbedConstructorOptions';

export default class HeroSkinsEmbed extends PaginationEmbed {
	constructor({ initialMessage, hero, locales }: IHeroEmbedConstructorOptions) {
		super({ initialMessage, locales });

		const embeds = hero.skins.map(skin => (
			new LocalizableMessageEmbed()
				.setTitle(l(skin.name))
				.setDescription(statsToString(skin.stats))
				.setThumbnail(imageUrl(`heroes/${skin.image}`))
				.addField('Sell price', `${skin.cost}${config.emojis.gold}`, true)
				.setColor(HeroClassColors[hero.clazz])
		));

		this.setArray(embeds)
			.showPageIndicator(false);
	}
}
