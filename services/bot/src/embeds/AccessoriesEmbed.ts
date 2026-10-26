import { Accessory, AccessoryOption } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import { arraify, capitalizeFirstLetter, chunk } from '../util/functions';
import config from '../config';

import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

const OPTIONS_PER_PAGE = 6;
const FIELD_VALUE_LIMIT = 1024;

interface IAccessoriesEmbedOptions {
	initial: InitialMessageSource;
	accessories: Accessory | Accessory[];
}

// Effect options describe timings in the full text; stats only need the short one
function optionLevels(option: AccessoryOption): string {
	const lines = (pick: 'description' | 'shortDescription'): string => option.levels
		.map(level => `**Lv${level.level}**: ${l(level[pick])}`)
		.join('\n');

	if (option.type === 'stat') return lines('shortDescription');

	const full = lines('description');

	return full.length <= FIELD_VALUE_LIMIT ? full : lines('shortDescription');
}

export default class AccessoriesEmbed extends PaginationEmbed {
	constructor({ initial, accessories }: IAccessoriesEmbedOptions) {
		super({ initial });

		const list = arraify(accessories);

		const infoPages = list.map(accessory => new PandoraEmbed()
			.setTitle(`${l(accessory.name)} (${accessory.grade}★ ${accessory.type})`)
			.setDescription(l(accessory.description))
			.addField('Rarity', capitalizeFirstLetter(accessory.rarity), true)
			.addField('Options', `up to ${accessory.maxOptions}`, true)
			.addField('Sell price', `${accessory.sellPrice}${config.emojis.gold}`, true)
			.addField('Extract', `${accessory.extractAntimatter} antimatter`, true)
			.toEmbed());

		// All accessories currently roll from the same pool, so list each option once
		const options = [...new Map(list.flatMap(a => a.options).map(o => [o.id, o])).values()];

		const optionPages = chunk(options, OPTIONS_PER_PAGE).map(pageOptions => {
			const page = new PandoraEmbed().setTitle('Possible accessory options');

			for (const option of pageOptions) {
				page.addField(l(option.name), optionLevels(option));
			}

			return page.toEmbed();
		});

		this.setArray([...infoPages, ...optionPages]);
	}
}
