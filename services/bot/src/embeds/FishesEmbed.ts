import { Fish } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import {
	capitalizeFirstLetter, imageUrl, toClearNumber, arraify
} from '../util/functions';
import config from '../config';

import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

const rewards: Record<string, string> = {
	ITEM_FISHCOIN: config.emojis.fishcoin,
	ITEM_GOLD: config.emojis.gold,
	RANDOMBOX_EVENT_GOOD_CATBOX: config.emojis.mossyCatChest,
	RANDOMBOX_EVENT_NORMAL_CATBOX: config.emojis.intactCatChest,
};

interface IFishesEmbedOptions {
	initial: InitialMessageSource;
	fishes: Fish | Fish[];
}

export default class FishesEmbed extends PaginationEmbed {
	constructor({ initial, fishes }: IFishesEmbedOptions) {
		super({ initial });

		const embeds = arraify(fishes).map(fish => new PandoraEmbed()
			.setTitle(`${l(fish.name)} (${fish.grade}★)`)
			.setDescription(l(fish.description))
			.addField('Exp', fish.exp, true)
			.addField('Area type', capitalizeFirstLetter(fish.habitat), true)
			.addField('Initial range', `${fish.startsFrom}m`, true)
			.addField(`Reward${fish.rewards.length > 1 ? 's' : ''}`,
				fish.rewards.map(r => `${r.amount > 1 ? toClearNumber(r.amount) : ''} ${rewards[r.type]}`).join('\n'),
				true)
			.setThumbnail(imageUrl(`fish/${fish.image}`))
			.toEmbed());

		this.setArray(embeds).showPageIndicator(false);
	}
}
