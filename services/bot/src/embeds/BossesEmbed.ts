import { Boss } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import { statsToString, imageUrl, arraify } from '../util/functions';

import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

interface IBossesEmbedOptions {
	initial: InitialMessageSource;
	bosses: Boss | Boss[];
}

export default class BossesEmbed extends PaginationEmbed {
	constructor({ initial, bosses }: IBossesEmbedOptions) {
		super({ initial });

		const embeds = arraify(bosses).map(boss => new PandoraEmbed()
			.setTitle(l(boss.name))
			.setDescription(statsToString(boss))
			.setThumbnail(imageUrl(`heroes/${boss.image}`))
			.toEmbed());

		this.setArray(embeds)
			.showPageIndicator(false);
	}
}
