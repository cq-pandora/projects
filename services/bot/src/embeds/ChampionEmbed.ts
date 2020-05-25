import { Message } from 'discord.js';
import { Champion } from '@pandora/entities';

import { imageUrl } from '../util/functions';

import PaginationEmbed from './PaginationEmbed';
import { l, LocalizableMessageEmbed } from './LocalizableMessageEmbed';

interface IChampionEmbedOptions {
	initialMessage: Message;
	champion: Champion;
	page?: number;
	locales: string[];
}

export default class ChampionEmbed extends PaginationEmbed {
	constructor(options: IChampionEmbedOptions) {
		super({
			initialMessage: options.initialMessage,
			locales: options.locales,
		});

		const { champion, page } = options;

		const embeds = options.champion.forms.map((form) => {
			const embed = new LocalizableMessageEmbed()
				.setTitle(l`${options.champion.name} (Lvl. ${form.grade})`)
				.setThumbnail(imageUrl(`heroes/${champion.image}`))
				.setDescription(l`${champion.lore}`);

			if (form.active) {
				embed.addField(l`${form.active.name} (Active)`, l`${form.active.description}`);
			}

			if (form.passive) {
				embed.addField(l`${form.passive.name} (Passive)`, l`${form.passive.description}`);
			}

			if (form.exclusive) {
				embed.addField(l`${form.exclusive.name} (Exclusive)`, l`${form.exclusive.description}`);
			}

			return embed;
		});

		this.setArray(embeds)
			.showPageIndicator(false);

		if (page) {
			this.setPage(page);
		}
	}
}
