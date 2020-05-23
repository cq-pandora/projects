import { Message } from 'discord.js';
import { Goddess } from '@pandora/entities';

import { imageUrl, arraify } from '../util/functions';

import PaginationEmbed from './PaginationEmbed';
import { l, LocalizableMessageEmbed } from './LocalizableMessageEmbed';

interface IGoddessesEmbedOptions {
	initialMessage: Message;
	goddesses: Goddess | Goddess[];
	locales: string[];
}

export default class GoddessesEmbed extends PaginationEmbed {
	constructor({ initialMessage, goddesses, locales }: IGoddessesEmbedOptions) {
		super({ initialMessage, locales });

		const embeds = arraify(goddesses).map(goddess => new LocalizableMessageEmbed()
			.setTitle(l(goddess.name))
			.addField(l(goddess.skillName), l(goddess.skillDescription))
			.setThumbnail(imageUrl(`heroes/${goddess.image}`)));

		this.setArray(embeds).showPageIndicator(false);
	}
}
