import { MessageEmbed, Message } from 'discord.js';
import { Hero, HeroClassColors } from '@pandora/entities';

import PaginationEmbed from './PaginationEmbed';
import { capitalizeFirstLetter, splitText, imageUrl } from '../util/functions';
import { translate } from '../cq-data';

export default class HeroFormsEmbed extends PaginationEmbed {
	constructor(initialMessage: Message, hero: Hero, page: number | undefined) {
		super(initialMessage);

		const embeds = hero.sbws.map((sbw) => {
			const embed = new MessageEmbed()
				.setTitle(`${translate(sbw.name)} (${sbw.star}★)`)
				.setThumbnail(imageUrl(`weapons/${sbw.image}`));

			const abilityChunks = splitText(translate(sbw.ability));

			for (const abilityChunk of abilityChunks) {
				embed.addField('\u200b', abilityChunk);
			}

			return embed
				.addField('Class', capitalizeFirstLetter(sbw.clazz), true)
			// .addField('Range', capitalizeFirstLetter(sb.range), true)
				.addField('Attack power', sbw.atkPower, true)
				.addField('Attack speed', sbw.atkSpeed, true);
		});

		this.setArray(embeds)
			.showPageIndicator(false)
			.setColor(HeroClassColors[hero.clazz]);

		if (page) {
			this.setPage(page);
		}
	}
}
