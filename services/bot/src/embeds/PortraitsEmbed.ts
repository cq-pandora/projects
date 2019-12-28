import { MessageEmbed, Message } from 'discord.js';

import PaginationEmbed from './PaginationEmbed';
import { imageUrl, arraify } from '../util/functions';

export default class PortraitsEmbed extends PaginationEmbed {
	constructor(initialMessage: Message, portraits: string | string[], page?: number) {
		super(initialMessage);

		const embeds = arraify(portraits).map(portrait => (
			new MessageEmbed()
				.setImage(imageUrl(`portraits/${portrait}`))
		));

		this.setArray(embeds)
			.showPageIndicator(false);

		if (page) {
			this.setPage(page);
		}
	}
}
