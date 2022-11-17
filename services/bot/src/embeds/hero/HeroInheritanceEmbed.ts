import { Message } from 'discord.js';

import {
	Hero, HeroClassColors, InheritanceLevel, HeroForm
} from '@cquest/entities';
import { inheritance, translate as l } from '@cquest/data-provider';

import {
	statsToString, imageUrl, sumStats, arraify
} from '../../util/functions';

import PaginationEmbed, { InitialMessageSource } from '../PaginationEmbed';
import PandoraEmbed from '../PandoraEmbed';

interface IHeroInheritanceEmbedOptions {
	initial: InitialMessageSource;
	hero: Hero;
	inherits: InheritanceLevel | InheritanceLevel[];
}

export default class HeroInheritanceEmbed extends PaginationEmbed {
	constructor({
		initial,
		hero,
		inherits,
	}: IHeroInheritanceEmbedOptions) {
		super({ initial });

		const form = hero.forms.find(f => f.star === 6) as HeroForm;
		const maxBerry = sumStats(form.maxBerries, form);

		const embeds = arraify(inherits).map(inheritLvl => (
			new PandoraEmbed()
				.setTitle(`${l(form.name)} (${inheritLvl === 0 ? '+Berry' : `Lv. ${inheritLvl}`})`)
				.setDescription(statsToString(
					inheritLvl !== 0
						? sumStats(inheritance[hero.clazz][inheritLvl], maxBerry)
						: maxBerry
				))
				.setThumbnail(imageUrl(`heroes/${form.image}`))
				.setColor(HeroClassColors[hero.clazz])
				.toEmbed()
		));

		this.setArray(embeds)
			.showPageIndicator(false);
	}
}
