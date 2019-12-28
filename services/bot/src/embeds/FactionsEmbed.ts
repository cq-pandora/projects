import { MessageEmbed, Message } from 'discord.js';
import { Faction } from '@pandora/entities';

import PaginationEmbed from './PaginationEmbed';
import { splitText, imageUrl, arraify } from '../util/functions';
import { translate, heroes } from '../cq-data';

export default class FactionsEmbed extends PaginationEmbed {
	constructor(initialMessage: Message, factions: Faction | Faction[]) {
		super(initialMessage);

		const embeds = arraify(factions).map((faction) => {
			const description = heroes
				.list()
				.filter(h => h.domain === faction.ingameId)
				.map(h => translate(h.forms[0].name));

			const embed = new MessageEmbed()
				.setTitle(translate(faction.name))
				.setThumbnail(imageUrl(`common/${faction.image}`));

			for (const chunk of splitText(description.join('\n'))) {
				embed.addField('\u200b', chunk);
			}

			return embed;
		});

		this.setArray(embeds)
			.showPageIndicator(false);
	}
}
