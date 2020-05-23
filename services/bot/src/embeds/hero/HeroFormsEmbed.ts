import { HeroClassColors } from '@pandora/entities';

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

		const faction = (!hero.domain || hero.domain === 'NONEGROUP')
			? '-'
			: `TEXT_CHAMPION_DOMAIN_${hero.domain}`;

		const embeds = hero.forms.map(form => new LocalizableMessageEmbed()
			.setTitle(l`${(form.name)} (${form.star}★)`)
			.setThumbnail(imageUrl(`heroes/${form.image}`))
			.setDescription(l(form.lore))
			.setColor(HeroClassColors[hero.clazz])
			.addField('Class', capitalizeFirstLetter(hero.clazz), true)
			.addField('Type', capitalizeFirstLetter(hero.type), true)
			.addField('Faction', l(faction), true)
			.addField('Gender', capitalizeFirstLetter(hero.gender), true));

		this.setArray(embeds)
			.showPageIndicator(false);

		if (page) {
			this.setPage(page);
		}
	}
}
