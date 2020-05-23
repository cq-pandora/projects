import { HeroClassColors } from '@pandora/entities';

import { imageUrl } from '../../util/functions';

import PaginationEmbed from '../PaginationEmbed';
import { l, LocalizableMessageEmbed } from '../LocalizableMessageEmbed';

import IHeroEmbedConstructorOptions from './IHeroEmbedConstructorOptions';

export default class HeroBlockEmbed extends PaginationEmbed {
	constructor({ initialMessage, locales, ...rest }: IHeroEmbedConstructorOptions) {
		super({ initialMessage, locales });

		const { hero, page } = rest;

		const embeds = hero.forms.map((form) => {
			const embed = new LocalizableMessageEmbed()
				.setTitle(l`${form.name} (${form.star}★)`)
				.setThumbnail(imageUrl(`skills/${form.blockImage}`))
				.setColor(HeroClassColors[hero.clazz])
				.addField(l`${form.blockName} (Lv. ${form.skillLvl})`, l(form.blockDescription));

			if (form.passiveName) {
				embed.addField(l(form.passiveName), l(form.passiveDescription));
			}

			return embed;
		});

		this.setArray(embeds)
			.showPageIndicator(false);

		if (page) {
			this.setPage(page);
		}
	}
}
