import { Message } from 'discord.js';

import PaginationEmbed from './PaginationEmbed';
import { LocalizableMessageEmbed } from './LocalizableMessageEmbed';
import { imageUrl, arraify } from '../util/functions';

interface IHeroInheritanceEmbedOptions {
	initialMessage: Message;
	portraits: string | string[];
	page?: number;
}

export default class PortraitsEmbed extends PaginationEmbed {
	constructor({ initialMessage, portraits, page }: IHeroInheritanceEmbedOptions) {
		super({ initialMessage });

		const embeds = arraify(portraits).map(portrait => (
			new LocalizableMessageEmbed()
				.setImage(imageUrl(`portraits/${portrait}`))
		));

		this.setArray(embeds)
			.showPageIndicator(false);

		if (page) {
			this.setPage(page);
		}
	}
}
