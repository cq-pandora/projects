import { HeroClassColors } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import { imageUrl, statsToString } from '../../util/functions';
import config from '../../config';

import PaginationEmbed from '../PaginationEmbed';
import PandoraEmbed from '../PandoraEmbed';

import IHeroEmbedConstructorOptions from './IHeroEmbedConstructorOptions';

export default class HeroSkinsEmbed extends PaginationEmbed {
	constructor({ hero, initial }: IHeroEmbedConstructorOptions) {
		super({ initial });

		const embeds = hero.skins.map(skin => (
			new PandoraEmbed()
				.setTitle(l(skin.name))
				.setDescription(statsToString(skin.stats))
				.setThumbnail(imageUrl(`heroes/${skin.image}`))
				.addField('Sell price', `${skin.cost}${config.emojis.gold}`, true)
				.setColor(HeroClassColors[hero.clazz])
				.toEmbed()
		));

		this.setArray(embeds)
			.showPageIndicator(false);
	}
}
