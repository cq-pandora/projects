import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

import { imageUrl, arraify } from '../util/functions';

interface IHeroInheritanceEmbedOptions {
	initial: InitialMessageSource;
	portraits: string | string[];
	page?: number;
}

export default class PortraitsEmbed extends PaginationEmbed {
	constructor({ initial, portraits, page }: IHeroInheritanceEmbedOptions) {
		super({ initial });

		const embeds = arraify(portraits).map(portrait => (
			new PandoraEmbed()
				.setImage(imageUrl(`portraits/${portrait}`))
				.toEmbed()
		));

		this.setArray(embeds)
			.showPageIndicator(false);

		if (page) {
			this.setPage(page);
		}
	}
}
