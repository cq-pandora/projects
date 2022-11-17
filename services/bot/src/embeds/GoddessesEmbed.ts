import { Goddess } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import { imageUrl, arraify } from '../util/functions';

import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

interface IGoddessesEmbedOptions {
	initial: InitialMessageSource;
	goddesses: Goddess | Goddess[];
}

export default class GoddessesEmbed extends PaginationEmbed {
	constructor({ initial, goddesses }: IGoddessesEmbedOptions) {
		super({ initial });

		const embeds = arraify(goddesses).map(goddess => new PandoraEmbed()
			.setTitle(l(goddess.name))
			.addField(l(goddess.skillName), l(goddess.skillDescription))
			.setThumbnail(imageUrl(`heroes/${goddess.image}`))
			.toEmbed());

		this.setArray(embeds).showPageIndicator(false);
	}
}
