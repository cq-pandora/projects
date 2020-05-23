import { Message } from 'discord.js';
import {
	Hero, HeroClassColors, InheritanceLevel, HeroForm
} from '@pandora/entities';

import {
	statsToString, imageUrl, sumStats, arraify
} from '../../util/functions';
import { inheritance } from '../../cq-data';

import PaginationEmbed from '../PaginationEmbed';
import { l, LocalizableMessageEmbed } from '../LocalizableMessageEmbed';

interface IHeroInheritanceEmbedOptions {
	initialMessage: Message;
	hero: Hero;
	inherits: InheritanceLevel | InheritanceLevel[];
	locale: string;
}

export default class HeroInheritanceEmbed extends PaginationEmbed {
	constructor({
		initialMessage,
		hero,
		inherits,
		locale
	}: IHeroInheritanceEmbedOptions) {
		super({ initialMessage, locales: [locale] });

		const form = hero.forms.find(f => f.star === 6) as HeroForm;
		const maxBerry = sumStats(form.maxBerries, form);

		const embeds = arraify(inherits).map(inheritLvl => (
			new LocalizableMessageEmbed()
				.setTitle(l`${form.name} (${inheritLvl === 0 ? '+Berry' : `Lv. ${inheritLvl}`})`)
				.setDescription(statsToString(
					inheritLvl !== 0
						? sumStats(inheritance[hero.clazz][inheritLvl], maxBerry)
						: maxBerry
				))
				.setThumbnail(imageUrl(`heroes/${form.image}`))
				.setColor(HeroClassColors[hero.clazz])
		));

		this.setArray(embeds)
			.showPageIndicator(false);
	}
}
