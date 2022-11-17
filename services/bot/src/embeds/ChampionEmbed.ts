import { Champion } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import { imageUrl } from '../util/functions';

import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

interface IChampionEmbedOptions {
	initial: InitialMessageSource;
	champion: Champion;
	page?: number;
}

export default class ChampionEmbed extends PaginationEmbed {
	constructor({ initial, champion, page }: IChampionEmbedOptions) {
		super({ initial });

		const embeds = champion.forms.map((form) => {
			const embed = new PandoraEmbed()
				.setTitle(`${l(champion.name)} (Lvl. ${form.grade})`)
				.setThumbnail(imageUrl(`heroes/${champion.image}`))
				.setDescription(l(champion.lore));

			if (form.active) {
				embed.addField(`${l(form.active.name)} (Active)`, l(form.active.description));
			}

			if (form.passive) {
				embed.addField(`${l(form.passive.name)} (Passive)`, l(form.passive.description));
			}

			if (form.exclusive) {
				embed.addField(`${l(form.exclusive.name)} (Exclusive)`, l(form.exclusive.description));
			}

			return embed.toEmbed();
		});

		this.setArray(embeds)
			.showPageIndicator(false);

		if (page) {
			this.setPage(page);
		}
	}
}
