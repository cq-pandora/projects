import { HeroClassColors } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import { imageUrl } from '../../util/functions';

import PaginationEmbed from '../PaginationEmbed';
import PandoraEmbed from '../PandoraEmbed';

import IHeroEmbedConstructorOptions from './IHeroEmbedConstructorOptions';

export default class HeroBlockEmbed extends PaginationEmbed {
	constructor({ initial, hero, page }: IHeroEmbedConstructorOptions) {
		super({ initial });

		const embeds = hero.forms.map((form) => {
			const embed = new PandoraEmbed()
				.setTitle(`${l(form.name)} (${form.star}★)`)
				.setThumbnail(imageUrl(`skills/${form.blockImage}`))
				.setColor(HeroClassColors[hero.clazz])
				.addField(`${l(form.blockName)} (Lv. ${form.skillLvl})`, l(form.blockDescription));

			if (form.passiveName) {
				embed.addField(l(form.passiveName), l(form.passiveDescription));
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
