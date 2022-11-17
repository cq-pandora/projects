import { HeroClassColors } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import { imageUrl } from '../../util/functions';

import PaginationEmbed from '../PaginationEmbed';
import PandoraEmbed from '../PandoraEmbed';

import IHeroEmbedConstructorOptions from './IHeroEmbedConstructorOptions';

export default class HeroSBWBlockEmbed extends PaginationEmbed {
	constructor({
		initial,
		hero,
		page,
	}: IHeroEmbedConstructorOptions) {
		super({ initial });

		const embeds = hero.forms.map((form) => {
			const sbw = hero.sbws.find(s => form.star === s.star);

			const embed = new PandoraEmbed()
				.setTitle(`${l(form.name)} (${form.star}★)`)
				.setThumbnail(imageUrl(`skills/${form.blockImage}`))
				.addField(`${l(form.blockName)} (Lv. ${form.skillLvl})`, l(form.blockDescription))
				.setColor(HeroClassColors[hero.clazz]);

			if (form.passiveName) {
				embed.addField(l(form.passiveName), l(form.passiveDescription));
			}

			if (sbw) {
				embed.addField('SBW effect', l(sbw.ability));
			}

			return embed.toEmbed();
		});

		this.setArray(embeds)
			.showPageIndicator(false);

		if (page) {
			this.setPage(page);
		}
	}
}
