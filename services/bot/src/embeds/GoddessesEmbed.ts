import { MessageEmbed, Message } from 'discord.js';
import { Goddess } from '@pandora/entities';

import PaginationEmbed from './PaginationEmbed';
import { imageUrl, arraify } from '../util/functions';
import { translate } from '../cq-data';

export default class GoddessesEmbed extends PaginationEmbed {
	constructor(initialMessage: Message, goddesses: Goddess | Goddess[]) {
		super(initialMessage);

		const embeds = arraify(goddesses).map(goddess => new MessageEmbed()
			.setTitle(translate(goddess.name))
			.addField(translate(goddess.skillName), translate(goddess.skillDescription))
			.setThumbnail(imageUrl(`heroes/${goddess.image}`)));

		this.setArray(embeds).showPageIndicator(false);
	}
}
