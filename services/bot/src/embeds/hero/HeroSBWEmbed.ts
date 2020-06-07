import { HeroClassColors } from '@cquest/entities';

import { capitalizeFirstLetter, imageUrl } from '../../util/functions';

import PaginationEmbed from '../PaginationEmbed';
import { l, LocalizableMessageEmbed } from '../LocalizableMessageEmbed';

import IHeroEmbedConstructorOptions from './IHeroEmbedConstructorOptions';

export default class HeroFormsEmbed extends PaginationEmbed {
	constructor({
		initialMessage,
		hero,
		page,
		locales
	}: IHeroEmbedConstructorOptions) {
		super({ initialMessage, locales });

		const embeds = hero.sbws.map((sbw) => {
			const embed = new LocalizableMessageEmbed()
				.setTitle(l`${sbw.name} (${sbw.star}★)`)
				.setThumbnail(imageUrl(`weapons/${sbw.image}`))
				.setDescription(l(sbw.ability));

			return embed
				.addField('Class', capitalizeFirstLetter(sbw.clazz), true)
			// .addField('Range', capitalizeFirstLetter(sb.range), true)
				.addField('Attack power', sbw.atkPower, true)
				.addField('Attack speed', sbw.atkSpeed, true)
				.setColor(HeroClassColors[hero.clazz]);
		});

		this.setArray(embeds)
			.showPageIndicator(false);

		if (page) {
			this.setPage(page);
		}
	}
}
