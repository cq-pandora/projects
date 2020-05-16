import { Message } from 'discord.js';
import { Berry } from '@pandora/entities';

import config from '../config';
import {
	capitalizeFirstLetter, imageUrl, toClearNumber, arraify
} from '../util';

import PaginationEmbed from './PaginationEmbed';
import { l, LocalizableMessageEmbed } from './LocalizableMessageEmbed';

export interface IBerriesEmbedOptions {
	initialMessage: Message;
	entities: Berry | Berry[];
	locales: string[];
}

export default class BerriesEmbed extends PaginationEmbed {
	constructor(options: IBerriesEmbedOptions) {
		super({
			initialMessage: options.initialMessage,
			locale: options.locales[0],
		});

		const berries = arraify(options.entities);

		const embeds = berries.map(berry => new LocalizableMessageEmbed()
			.setTitle(l`${berry.name} (${berry.grade}★)`)
			.setThumbnail(imageUrl(`berries/${berry.image}`))
			.addField('Rarity', capitalizeFirstLetter(berry.rarity), true)
			.addField('Stat', capitalizeFirstLetter(berry.targetStat), true)
			.addField('Great rate', `${(100 * berry.greatChance)}%`, true)
			.addField('Stat value', berry.isPercentage ? `${(100 * berry.value)}%` : berry.value, true)
			.addField('Sell price', `${toClearNumber(berry.sellCost)}${config.emojis.gold}`, true)
			.addField('Eat cost', `${toClearNumber(berry.eatCost)}${config.emojis.gold}`, true));

		this.setArray(embeds).showPageIndicator(false);
	}
}
