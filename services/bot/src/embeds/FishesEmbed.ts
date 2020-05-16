import { Message } from 'discord.js';
import { Fish } from '@pandora/entities';

import {
	capitalizeFirstLetter, imageUrl, toClearNumber, arraify
} from '../util/functions';
import config from '../config';

import PaginationEmbed from './PaginationEmbed';
import { l, LocalizableMessageEmbed } from './LocalizableMessageEmbed';

const rewards: Record<string, string> = {
	ITEM_FISHCOIN: config.emojis.fishcoin,
	ITEM_GOLD: config.emojis.gold,
	RANDOMBOX_EVENT_GOOD_CATBOX: config.emojis.mossyCatChest,
	RANDOMBOX_EVENT_NORMAL_CATBOX: config.emojis.intactCatChest,
};

interface IFishesEmbedOptions {
	initialMessage: Message;
	fishes: Fish | Fish[];
	locales: string[];
}

export default class FishesEmbed extends PaginationEmbed {
	constructor({ initialMessage, fishes, locales }: IFishesEmbedOptions) {
		super({
			initialMessage,
			locale: locales[0],
		});

		const embeds = arraify(fishes).map(fish => new LocalizableMessageEmbed()
			.setTitle(l`${fish.name} (${fish.grade}★)`)
			.setDescription(l`${fish.description}`)
			.addField('Exp', fish.exp, true)
			.addField('Area type', capitalizeFirstLetter(fish.habitat), true)
			.addField('Initial range', `${fish.startsFrom}m`, true)
			.addField(`Reward${fish.rewards.length > 1 ? 's' : ''}`,
				fish.rewards.map(r => `${r.amount > 1 ? toClearNumber(r.amount) : ''} ${rewards[r.type]}`).join('\n'),
				true)
			.setThumbnail(imageUrl(`fish/${fish.image}`)));

		this.setArray(embeds).showPageIndicator(false);
	}
}
