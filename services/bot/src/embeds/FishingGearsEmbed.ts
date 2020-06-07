import { Message } from 'discord.js';
import { FishingGear } from '@cquest/entities';

import PaginationEmbed from './PaginationEmbed';
import { LocalizableMessageEmbed, l } from './LocalizableMessageEmbed';

import {
	capitalizeFirstLetter, imageUrl, toClearNumber, arraify
} from '../util/functions';
import config from '../config';

const currencies: Record<string, string> = {
	ITEM_FISHCOIN: config.emojis.fishcoin,
	ITEM_GOLD: config.emojis.gold,
	ITEM_HONOR: config.emojis.honor,
	ITEM_JEWEL: config.emojis.gem,
};

export interface IFishingGearsEmbedOptions {
	initialMessage: Message;
	gears: FishingGear | FishingGear[];
	locales: string[];
}

export default class FishingGearsEmbed extends PaginationEmbed {
	constructor({ locales, initialMessage, gears }: IFishingGearsEmbedOptions) {
		super({ initialMessage, locales });

		const embeds = arraify(gears).map((gear) => {
			const embed = new LocalizableMessageEmbed()
				.setTitle(l`${gear.name} (${gear.grade}★)`)
				.setDescription(l`${gear.description}`)
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
