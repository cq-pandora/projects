import { HeroClassColors } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import { capitalizeFirstLetter, imageUrl } from '../../util/functions';

import PaginationEmbed from '../PaginationEmbed';
import PandoraEmbed from '../PandoraEmbed';

import IHeroEmbedConstructorOptions from './IHeroEmbedConstructorOptions';

export default class HeroFormsEmbed extends PaginationEmbed {
	constructor({
		initial,
		hero,
		page,
	}: IHeroEmbedConstructorOptions) {
		super({ initial });

		const faction = (!hero.domain || hero.domain === 'NONEGROUP')
			? '-'
			: `TEXT_CHAMPION_DOMAIN_${hero.domain}`;

		const embeds = hero.forms.map(form => new PandoraEmbed()
			.setTitle(`${l(form.name)} (${form.star}★)`)
			.setThumbnail(imageUrl(`heroes/${form.image}`))
			.setDescription(l(form.lore))
			.setColor(HeroClassColors[hero.clazz])
			.addField('Class', capitalizeFirstLetter(hero.clazz), true)
			.addField('Type', capitalizeFirstLetter(hero.type), true)
			.addField('Faction', l(faction), true)
			.addField('Gender', capitalizeFirstLetter(hero.gender), true)
			.toEmbed());

		this.setArray(embeds)
			.showPageIndicator(false);

		if (page) {
			this.setPage(page);
		}
	}
}
