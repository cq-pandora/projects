import { MessageEmbed, Message } from 'discord.js';
import { Berry } from '@pandora/entities';

import PaginationEmbed from './PaginationEmbed';
import config from '../config';
import {
	capitalizeFirstLetter, imageUrl, toClearNumber, arraify
} from '../util';
import { translate } from '../cq-data';

export default class BerriesEmbed extends PaginationEmbed {
	constructor(initialMessage: Message, berriesRaw: Berry | Berry[]) {
		super(initialMessage);

		const berries = arraify(berriesRaw);

		const embeds = berries.map(berry => new MessageEmbed()
			.setTitle(`${translate(berry.name)} (${berry.grade}★)`)
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
