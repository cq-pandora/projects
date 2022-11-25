import { Scarecrow } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import { imageUrl, arraify, statsToString } from '../util/functions';

import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

interface IScarecrowsEmbedOptions {
	initial: InitialMessageSource;
	scarecrows: Scarecrow | Scarecrow[];
}

export default class ScarecrowsEmbed extends PaginationEmbed {
	constructor({ initial, scarecrows }: IScarecrowsEmbedOptions) {
		super({ initial });

		const embeds = arraify(scarecrows)
			.map(scarecrow => new PandoraEmbed()
				.setTitle(l(scarecrow.name))
				.setDescription(l(scarecrow.description))
				.addNoNameField(statsToString(scarecrow))
				.setThumbnail(imageUrl(`heroes/${scarecrow.image}`))
				.toEmbed());

		this.setArray(embeds).showPageIndicator(false);
	}
}
