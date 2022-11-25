import { FishingGear } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

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
	initial: InitialMessageSource;
	gears: FishingGear | FishingGear[];
}

export default class FishingGearsEmbed extends PaginationEmbed {
	constructor({ initial, gears }: IFishingGearsEmbedOptions) {
		super({ initial });

		const embeds = arraify(gears).map((gear) => {
			const embed = new PandoraEmbed()
				.setTitle(`${l(gear.name)} (${gear.grade}★)`)
				.setDescription(l(gear.description))
				.addField(`${capitalizeFirstLetter(gear.habitat)} bonus`, gear.habitatBonus, true)
				.addField('Bite chance', gear.biteChance, true)
				.addField('Big fish chance', gear.bigChance, true)
				.addField('Price', `${toClearNumber(gear.price)}${currencies[gear.currency]}`, true)
				.setThumbnail(imageUrl(`fish/${gear.image}`));

			if (gear.eventChance) {
				embed.addField('Event bonus', gear.eventChance);
			}

			return embed.toEmbed();
		});

		this.setArray(embeds).showPageIndicator(false);
	}
}
