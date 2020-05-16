import { Message } from 'discord.js';
import { Boss } from '@pandora/entities';

import { statsToString, imageUrl, arraify } from '../util/functions';

import PaginationEmbed from './PaginationEmbed';
import { l, LocalizableMessageEmbed } from './LocalizableMessageEmbed';

interface IBossesEmbedOptions {
	initialMessage: Message;
	bosses: Boss | Boss[];
	locales: string[];
}

export default class BossesEmbed extends PaginationEmbed {
	constructor(options: IBossesEmbedOptions) {
		super({
			initialMessage: options.initialMessage,
			locale: options.locales[0],
		});

		const embeds = arraify(options.bosses).map(boss => new LocalizableMessageEmbed()
			.setTitle(l`${boss.name}`)
			.setDescription(statsToString(boss))
			.setThumbnail(imageUrl(`heroes/${boss.image}`)));

		this.setArray(embeds)
			.showPageIndicator(false);
	}
}
