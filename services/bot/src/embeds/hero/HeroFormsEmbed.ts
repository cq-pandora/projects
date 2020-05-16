import { Message } from 'discord.js';
import { Hero, HeroClassColors } from '@pandora/entities';

import { capitalizeFirstLetter, imageUrl } from '../../util/functions';

import PaginationEmbed from '../PaginationEmbed';
import { l, LocalizableMessageEmbed } from '../LocalizableMessageEmbed';

import IHeroEmbedConstructorOptions from './IHeroEmbedConstructorOptions';

interface IHeroFormsEmbedOptions {
	initialMessage: Message;
	hero: Hero;
	page?: number;
	locale: string;
}

export default class HeroFormsEmbed extends PaginationEmbed {
	constructor({
		initialMessage,
		hero,
		page,
		locale
	}: IHeroEmbedConstructorOptions) {
		super({ initialMessage, locale });

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
