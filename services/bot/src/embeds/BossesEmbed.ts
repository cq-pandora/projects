import { MessageEmbed, Message } from 'discord.js';
import { Boss } from '@pandora/entities';

import PaginationEmbed from './PaginationEmbed';
import { statsToString, imageUrl, arraify } from '../util/functions';
import { translate } from '../cq-data';

export default class BossesEmbed extends PaginationEmbed {
	constructor(initialMessage: Message, bosses: Boss | Boss[]) {
		super(initialMessage);

		const embeds = arraify(bosses).map(boss => new MessageEmbed()
			.setTitle(`${translate(boss.name)}`)
			.setDescription(statsToString(boss))
			.setThumbnail(imageUrl(`heroes/${boss.image}`)));

		this.setArray(embeds)
			.showPageIndicator(false);
	}
}
