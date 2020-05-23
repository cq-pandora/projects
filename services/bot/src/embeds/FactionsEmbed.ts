import { Message } from 'discord.js';
import { Faction } from '@pandora/entities';

import { imageUrl, arraify } from '../util/functions';
import { translate, heroes } from '../cq-data';

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

			const a = new Array<string>(heroesKeys.length).fill('\n');

			return new LocalizableMessageEmbed()
				.setTitle(translate(faction.name))
				.setThumbnail(imageUrl(`common/${faction.image}`))
				.addField('\u200b', l(a, heroesKeys));
		});

		this.setArray(embeds)
			.showPageIndicator(false);
	}
}
