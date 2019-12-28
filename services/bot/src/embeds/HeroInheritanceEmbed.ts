import { MessageEmbed, Message } from 'discord.js';
import {
	Hero, HeroClassColors, InheritanceLevel, HeroForm
} from '@pandora/entities';

import PaginationEmbed from './PaginationEmbed';
import {
	statsToString, imageUrl, sumStats, arraify
} from '../util/functions';
import { translate, inheritance } from '../cq-data';

export default class HeroInheritanceEmbed extends PaginationEmbed {
	constructor(initialMessage: Message, hero: Hero, inherits: InheritanceLevel | InheritanceLevel[]) {
		super(initialMessage);

		const form = hero.forms.find(f => f.star === 6) as HeroForm;
		const maxBerry = sumStats(form.maxBerries, form);

		const embeds = arraify(inherits).map(inheritLvl => (
			new MessageEmbed()
				.setTitle(`${translate(form.name)} (${inheritLvl === 0 ? '+Berry' : `Lv. ${inheritLvl}`})`)
				.setDescription(statsToString(
					inheritLvl !== 0
						? sumStats(inheritance[hero.clazz][inheritLvl], maxBerry)
						: maxBerry
				))
				.setThumbnail(imageUrl(`heroes/${form.image}`))
		));

		this.setArray(embeds)
			.showPageIndicator(false)
			.setColor(HeroClassColors[hero.clazz]);
	}
}
