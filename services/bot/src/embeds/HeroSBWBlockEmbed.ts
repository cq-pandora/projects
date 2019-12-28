import { MessageEmbed, Message } from 'discord.js';
import { Hero, HeroClassColors, HeroForm } from '@pandora/entities';

import PaginationEmbed from './PaginationEmbed';
import { splitText, imageUrl } from '../util/functions';
import { translate } from '../cq-data';

export default class HeroSBWBlockEmbed extends PaginationEmbed {
	constructor(initialMessage: Message, hero: Hero, page: number | undefined) {
		super(initialMessage);

		const embeds = hero.sbws.map((sbw) => {
			const form = hero.forms.find(f => f.star === sbw.star) as HeroForm;

			const embed = new MessageEmbed()
				.setTitle(`${translate(form.name)} (${form.star}★)`)
				.setThumbnail(imageUrl(`skills/${form.blockImage}`))
				.addField(`${translate(form.blockName)} (Lv. ${form.skillLvl})`, translate(form.blockDescription));

			const abilityChunks = splitText(translate(form.passiveDescription));

			embed.addField(translate(form.passiveName), abilityChunks.shift());

			for (const abilityChunk of abilityChunks) {
				embed.addField('\u200b', abilityChunk);
			}

			const sbwChunks = splitText(translate(sbw.ability));

			embed.addField('SBW effect', sbwChunks.shift());

			for (const sbwChunk of sbwChunks) {
				embed.addField('\u200b', sbwChunk);
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
