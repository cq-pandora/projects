import { MessageEmbed, Message } from 'discord.js';
import { Hero, HeroClassColors } from '@pandora/entities';

import PaginationEmbed from './PaginationEmbed';
import { capitalizeFirstLetter, imageUrl } from '../util/functions';
import { translate } from '../cq-data';

export default class HeroFormsEmbed extends PaginationEmbed {
	constructor(initialMessage: Message, hero: Hero, page: number | undefined) {
		super(initialMessage);

		const embeds = hero.forms.map(form => (
			new MessageEmbed()
				.setTitle(`${translate(form.name)} (${form.star}★)`)
				.setDescription(translate(form.lore))
				.setThumbnail(imageUrl(`heroes/${form.image}`))
		));

		const faction = (!hero.domain || hero.domain === 'NONEGROUP')
			? '-'
			: translate(`TEXT_CHAMPION_DOMAIN_${hero.domain}`);

		this.setArray(embeds)
			.showPageIndicator(false)
			.setColor(HeroClassColors[hero.clazz])
			.addField('Class', capitalizeFirstLetter(hero.clazz), true)
			.addField('Type', capitalizeFirstLetter(hero.type), true)
			.addField('Faction', faction, true)
			.addField('Gender', capitalizeFirstLetter(hero.gender), true);

		if (page) {
			this.setPage(page);
		}
	}
}
