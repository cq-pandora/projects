import { HeroClassColors } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import { capitalizeFirstLetter, imageUrl } from '../../util/functions';

import PaginationEmbed from '../PaginationEmbed';
import PandoraEmbed from '../PandoraEmbed';

import IHeroEmbedConstructorOptions from './IHeroEmbedConstructorOptions';

export default class HeroFormsEmbed extends PaginationEmbed {
	constructor({
		hero,
		page,
		initial
	}: IHeroEmbedConstructorOptions) {
		super({ initial });

		const embeds = hero.sbws.map(sbw => new PandoraEmbed()
			.setTitle(`${l(sbw.name)} (${sbw.star}★)`)
			.setThumbnail(imageUrl(`weapons/${sbw.image}`))
			.setDescription(l(sbw.ability))
			.addField('Class', capitalizeFirstLetter(sbw.clazz), true)
		// .addField('Range', capitalizeFirstLetter(sb.range), true)
			.addField('Attack power', sbw.atkPower, true)
			.addField('Attack speed', sbw.atkSpeed, true)
			.setColor(HeroClassColors[hero.clazz])
			.toEmbed());

		this.setArray(embeds)
			.showPageIndicator(false);

		if (page) {
			this.setPage(Math.min(page, embeds.length));
		}
	}
}
