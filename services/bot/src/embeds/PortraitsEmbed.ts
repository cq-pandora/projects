import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

import { imageUrl, arraify } from '../util/functions';

interface IPortraitsEmbedOptions {
	initial: InitialMessageSource;
	portraits: string | string[];
	// Character name shown above the portrait, so a fuzzy match is recognizable
	title?: string;
	page?: number;
}

export default class PortraitsEmbed extends PaginationEmbed {
	constructor({
		initial, portraits, title, page,
	}: IPortraitsEmbedOptions) {
		super({ initial });

		const embeds = arraify(portraits).map((portrait) => {
			const embed = new PandoraEmbed().setImage(imageUrl(`portraits/${portrait}`));

			if (title) embed.setTitle(title);

			return embed.toEmbed();
		});

		this.setArray(embeds)
			.showPageIndicator(false);

		if (page) {
			this.setPage(page);
		}
	}
}
