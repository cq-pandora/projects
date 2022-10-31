import { Message } from 'discord.js';
import { Scarecrow } from '@cquest/entities';

import { imageUrl, arraify, statsToString } from '../util/functions';

import PaginationEmbed from './PaginationEmbed';
import { l, LocalizableMessageEmbed } from './LocalizableMessageEmbed';

interface IScarecrowsEmbedOptions {
	initialMessage?: Message;
	scarecrows: Scarecrow | Scarecrow[];
	locales: string[];
}

export default class ScarecrowsEmbed extends PaginationEmbed {
	constructor({ initialMessage, locales, scarecrows }: IScarecrowsEmbedOptions) {
		super({ initialMessage, locales });

		const embeds = arraify(scarecrows)
			.map(scarecrow => new LocalizableMessageEmbed()
				.setTitle(l(scarecrow.name))
				.setDescription(l(scarecrow.description))
				.addNoNameField(statsToString(scarecrow))
				.setThumbnail(imageUrl(`heroes/${scarecrow.image}`)));

		this.setArray(embeds).showPageIndicator(false);
	}
}
