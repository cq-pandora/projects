import { Message } from 'discord.js';
import { Faction } from '@cquest/entities';

import { imageUrl, arraify } from '../util/functions';
import { heroes } from '../cq-data';

import PaginationEmbed from './PaginationEmbed';
import { l, LocalizableMessageEmbed } from './LocalizableMessageEmbed';

interface IFactionsEmbedOptions {
	initialMessage: Message;
	factions: Faction | Faction[];
	locales: string[];
}

export default class FactionsEmbed extends PaginationEmbed {
	constructor({ initialMessage, factions, locales }: IFactionsEmbedOptions) {
		super({ initialMessage, locales });

		const embeds = arraify(factions).map((faction) => {
			const heroesKeys = heroes
				.list()
				.filter(h => h.domain === faction.ingameId)
				.map(h => h.forms[0].name);

			return new LocalizableMessageEmbed()
				.setTitle(l(faction.name))
				.setThumbnail(imageUrl(`common/${faction.image}`))
				.addField('\u200b', {
					strings: new Array<string>(heroesKeys.length).fill('\n'),
					keys: heroesKeys
				});
		});

		this.setArray(embeds)
			.showPageIndicator(false);
	}
}
