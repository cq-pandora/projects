import { MessageEmbed, Message } from 'discord.js';
import { Hero, HeroClassColors } from '@pandora/entities';

import PaginationEmbed from './PaginationEmbed';
import {
	splitText, imageUrl
} from '../util/functions';
import { translate } from '../cq-data';

export default class HeroBlockEmbed extends PaginationEmbed {
	constructor(initialMessage: Message, hero: Hero, page: number | undefined) {
		super(initialMessage);

		const embeds = hero.forms.map((form) => {
			const embed = new MessageEmbed()
				.setTitle(`${translate(form.name)} (${form.star}★)`)
				.setThumbnail(imageUrl(`skills/${form.blockImage}`))
				.addField(`${translate(form.blockName)} (Lv. ${form.skillLvl})`, translate(form.blockDescription));

			const chunks = form.passiveName
				? splitText(translate(form.passiveDescription))
				: [];

			let atFirst = true;
			for (const chunk of chunks) {
				embed.addField(atFirst ? '\u200b' : translate(form.passiveName), chunk);

				atFirst = false;
			}

			return embed;
		});

		this.setArray(embeds)
			.showPageIndicator(false)
			.setColor(HeroClassColors[hero.clazz]);

		if (page) {
			this.setPage(page);
		}
	}
}
