import { MessageEmbed, Message } from 'discord.js';
import { FishingGear } from '@pandora/entities';

import PaginationEmbed from './PaginationEmbed';
import {
	capitalizeFirstLetter, imageUrl, toClearNumber, arraify
} from '../util/functions';
import { translate } from '../cq-data';
import config from '../config';

const currencies: Record<string, string> = {
	ITEM_FISHCOIN: config.emojis.fishcoin,
	ITEM_GOLD: config.emojis.gold,
	ITEM_HONOR: config.emojis.honor,
	ITEM_JEWEL: config.emojis.gem,
};

export default class FishingGearsEmbed extends PaginationEmbed {
	constructor(initialMessage: Message, gears: FishingGear | FishingGear[]) {
		super(initialMessage);

		const embeds = arraify(gears).map((gear) => {
			const embed = new MessageEmbed()
				.setTitle(`${translate(gear.name)} (${gear.grade}★)`)
				.setDescription(translate(gear.description))
				.addField(`${capitalizeFirstLetter(gear.habitat)} bonus`, gear.habitatBonus, true)
				.addField('Bite chance', gear.biteChance, true)
				.addField('Big fish chance', gear.bigChance, true)
				.addField('Price', `${toClearNumber(gear.price)}${currencies[gear.currency]}`, true)
				.setThumbnail(imageUrl(`fish/${gear.image}`));

			if (gear.eventChance) {
				embed.addField('Event bonus', gear.eventChance);
			}

			return embed;
		});

		this.setArray(embeds).showPageIndicator(false);
	}
}
