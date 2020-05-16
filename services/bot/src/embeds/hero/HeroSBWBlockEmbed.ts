import { HeroClassColors } from '@pandora/entities';

import { imageUrl } from '../../util/functions';

import PaginationEmbed from '../PaginationEmbed';
import { l, LocalizableMessageEmbed } from '../LocalizableMessageEmbed';

import IHeroEmbedConstructorOptions from './IHeroEmbedConstructorOptions';

export default class HeroSBWBlockEmbed extends PaginationEmbed {
	constructor({
		initialMessage,
		hero,
		page,
		locale
	}: IHeroEmbedConstructorOptions) {
		super({ initialMessage, locale });

		const embeds = hero.forms.map((form) => {
			const sbw = hero.sbws.find(s => form.star === s.star);

			const embed = new LocalizableMessageEmbed()
				.setTitle(l`${form.name} (${form.star}★)`)
				.setThumbnail(imageUrl(`skills/${form.blockImage}`))
				.addField(l`${form.blockName} (Lv. ${form.skillLvl})`, l(form.blockDescription))
				.setColor(HeroClassColors[hero.clazz]);

			if (form.passiveName) {
				embed.addField(l(form.passiveName), l(form.passiveDescription));
			}

			if (sbw) {
				embed.addField('SBW effect', l(sbw.ability));
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
