import { Berry } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import config from '../config';
import {
	capitalizeFirstLetter, imageUrl, toClearNumber, arraify, translateStat, formatStatValue
} from '../util';

import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

export interface IBerriesEmbedOptions {
	initial: InitialMessageSource;
	entities: Berry | Berry[];
}

export default class BerriesEmbed extends PaginationEmbed {
	constructor({ initial, entities }: IBerriesEmbedOptions) {
		super({ initial });

		const berries = arraify(entities);

		const embeds = berries.map((berry) => {
			const embed = new PandoraEmbed()
				.setTitle(`${l(berry.name)} (${berry.grade}★)`)
				.setThumbnail(imageUrl(`berries/${berry.image}`))
				.addField('Rarity', capitalizeFirstLetter(berry.rarity), true)
				.addField('Stat', translateStat(berry.targetStat) ?? berry.targetStat, true)
				.addField('Great rate', `${toClearNumber((100 * berry.greatChance).toFixed(2))}%`, true);

			// Success berries only raise the great rate and carry no stat value
			if (berry.value > 0) {
				// Ratio berries are a share of the stat's berry cap; flat ones use the stat's unit (crit 0.002 = 0.2%)
				const value = berry.isPercentage
					? `${toClearNumber((100 * berry.value).toFixed(2))}%`
					: formatStatValue(berry.targetStat, berry.value);

				embed.addField('Stat value', value, true);
			}

			return embed
				.addField('Sell price', `${toClearNumber(berry.sellCost)}${config.emojis.gold}`, true)
				.addField('Eat cost', `${toClearNumber(berry.eatCost)}${config.emojis.gold}`, true)
				.toEmbed();
		});

		this.setArray(embeds);
	}
}
