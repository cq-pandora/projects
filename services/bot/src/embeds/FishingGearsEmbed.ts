import { FishingGear } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

import { imageUrl, toClearNumber, arraify } from '../util/functions';
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
				.setTitle(`${l(gear.name)} (Lv. ${gear.grade})`)
				.setDescription(l(gear.description))
				.setThumbnail(imageUrl(`fish/${gear.image}`));

			if (gear.habitat === 'event') {
				embed.addField(l('TEXT_FISHING_GEAR_OPTION_EVENT'), gear.eventChance, true);
			} else {
				embed.addField(l(`TEXT_FISHING_GEAR_OPTION_${gear.habitat.toUpperCase()}`), gear.habitatBonus, true);
			}

			embed
				.addField(l('TEXT_FISHING_GEAR_OPTION_1'), gear.power, true)
				.addField(l('TEXT_FISHING_GEAR_OPTION_3'), gear.biteChance, true)
				.addField(l('TEXT_FISHING_GEAR_OPTION_2'), gear.bigChance, true);

			if (gear.howToGet === 'collection') {
				embed.addField('How to get', `${l('TEXT_COLLECTION_FISH')} reward: ${l(gear.collectionReward ?? undefined)}`, true);
			} else {
				embed.addField('Price', `${toClearNumber(gear.price)}${currencies[gear.currency]}`, true);
			}

			if (gear.habitat !== 'event' && gear.eventChance) {
				embed.addField(l('TEXT_FISHING_GEAR_OPTION_EVENT'), gear.eventChance, true);
			}

			return embed.toEmbed();
		});

		this.setArray(embeds).showPageIndicator(false);
	}
}
