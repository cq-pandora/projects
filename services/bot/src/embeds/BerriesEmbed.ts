import { Berry } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import config from '../config';
import {
	capitalizeFirstLetter, imageUrl, toClearNumber, arraify
} from '../util';

import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

export interface IBerriesEmbedOptions {
	initial: InitialMessageSource;
	entities: Berry | Berry[];
}

export default class BerriesEmbed extends PaginationEmbed {
	constructor({ initial, entities }: IBerriesEmbedOptions) {
		super({ initial });

		const berries = arraify(entities);

		const embeds = berries.map(berry => new PandoraEmbed()
			.setTitle(`${l(berry.name)} (${berry.grade}★)`)
			.setThumbnail(imageUrl(`berries/${berry.image}`))
			.addField('Rarity', capitalizeFirstLetter(berry.rarity), true)
			.addField('Stat', capitalizeFirstLetter(berry.targetStat), true)
			.addField('Great rate', `${(100 * berry.greatChance)}%`, true)
			.addField('Stat value', berry.isPercentage ? `${(100 * berry.value)}%` : berry.value, true)
			.addField('Sell price', `${toClearNumber(berry.sellCost)}${config.emojis.gold}`, true)
			.addField('Eat cost', `${toClearNumber(berry.eatCost)}${config.emojis.gold}`, true)
			.toEmbed());

		this.setArray(embeds).showPageIndicator(false);
	}
}
