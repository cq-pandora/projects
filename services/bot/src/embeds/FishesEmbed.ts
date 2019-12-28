import { MessageEmbed, Message } from 'discord.js';
import { Fish } from '@pandora/entities';

import PaginationEmbed from './PaginationEmbed';
import {
	capitalizeFirstLetter, imageUrl, toClearNumber, arraify
} from '../util/functions';
import { translate } from '../cq-data';
import config from '../config';

const rewards: Record<string, string> = {
	ITEM_FISHCOIN: config.emojis.fishcoin,
	ITEM_GOLD: config.emojis.gold,
	RANDOMBOX_EVENT_GOOD_CATBOX: config.emojis.mossyCatChest,
	RANDOMBOX_EVENT_NORMAL_CATBOX: config.emojis.intactCatChest,
};

export default class FishesEmbed extends PaginationEmbed {
	constructor(initialMessage: Message, fishes: Fish | Fish[]) {
		super(initialMessage);

		const embeds = arraify(fishes).map(fish => new MessageEmbed()
			.setTitle(`${translate(fish.name)} (${fish.grade}★)`)
			.setDescription(translate(fish.description))
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
