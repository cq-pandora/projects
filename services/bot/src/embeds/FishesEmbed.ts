import { Fish, FishReward } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import {
	capitalizeFirstLetter, imageUrl, toClearNumber, arraify
} from '../util/functions';
import config from '../config';

import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

const rewardEmojis: Record<string, string> = {
	ITEM_FISHCOIN: config.emojis.fishcoin,
	ITEM_GOLD: config.emojis.gold,
	RANDOMBOX_EVENT_GOOD_CATBOX: config.emojis.intactCatChest,
	RANDOMBOX_EVENT_NORMAL_CATBOX: config.emojis.mossyCatChest,
};

function formatReward(reward: FishReward): string {
	const amount = reward.amount > 1 ? `${toClearNumber(reward.amount)} ` : '';

	return `${amount}${rewardEmojis[reward.type] ?? (l(reward.name) || reward.type)}`;
}

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
			.addField(`Reward${fish.rewards.length > 1 ? 's' : ''}`, fish.rewards.map(formatReward).join('\n'), true)
			.setThumbnail(imageUrl(`fish/${fish.image}`))
			.toEmbed());

		this.setArray(embeds).showPageIndicator(false);
	}
}
