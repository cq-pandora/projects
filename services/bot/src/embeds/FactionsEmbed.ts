import { Faction } from '@cquest/entities';
import { heroes, translate as l } from '@cquest/data-provider';

import { imageUrl, arraify } from '../util/functions';

import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

interface IFactionsEmbedOptions {
	initial: InitialMessageSource;
	factions: Faction | Faction[];
}

export default class FactionsEmbed extends PaginationEmbed {
	constructor({ initial, factions }: IFactionsEmbedOptions) {
		super({ initial });

		const embeds = arraify(factions).map((faction) => {
			const heroesNames = heroes
				.list()
				.filter(h => h.domain === faction.ingameId)
				.map(h => l(h.forms[0].name));

			return new PandoraEmbed()
				.setTitle(l(faction.name))
				.setThumbnail(imageUrl(`common/${faction.image}`))
				.addField('\u200b', heroesNames.join('\n'))
				.toEmbed();
		});

		this.setArray(embeds)
			.showPageIndicator(false);
	}
}
