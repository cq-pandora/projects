import { Accessory, AccessoryOption } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import {
	arraify, capitalizeFirstLetter, imageUrl, splitText, toClearNumber
} from '../util/functions';
import config from '../config';

import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

// Discord caps an embed at 6000 characters and 25 fields; keep a margin for title and footer
const PAGE_CHARS_LIMIT = 5500;
const PAGE_FIELDS_LIMIT = 25;
const FIELD_VALUE_LIMIT = 1024;
const OPTIONS_TITLE = 'Possible accessory options';

interface IAccessoriesEmbedOptions {
	initial: InitialMessageSource;
	accessories: Accessory | Accessory[];
}

interface IField {
	name: string;
	value: string;
}

const SENTENCE_SPLIT = /(?<=[.!?])\s+/;

/**
 * Effect options repeat the same rule sentences on every level ("This effect cannot overlap...");
 * they are shown once below the levels so the per-level numbers fit, stats only need the short text.
 * The first sentence is the effect itself and always stays on its level.
 */
function optionFields(option: AccessoryOption): IField[] {
	let lines: string[];

	if (option.type === 'stat') {
		lines = option.levels.map(level => `**Lv${level.level}**: ${l(level.shortDescription)}`);
	} else {
		const sentences = option.levels.map(level => l(level.description).split(SENTENCE_SPLIT));
		const shared = sentences[0].slice(1).filter(s => sentences.every(other => other.slice(1).includes(s)));

		lines = option.levels.map((level, idx) => {
			const own = sentences[idx].filter((s, pos) => pos === 0 || !shared.includes(s));

			return `**Lv${level.level}**: ${own.join(' ')}`;
		});

		if (shared.length) lines.push(`*${shared.join(' ')}*`);
	}

	return splitText(lines.join('\n'), FIELD_VALUE_LIMIT, '\n')
		.map((value, idx) => ({ name: idx === 0 ? l(option.name) : '\u200b', value }));
}

export default class AccessoriesEmbed extends PaginationEmbed {
	constructor({ initial, accessories }: IAccessoriesEmbedOptions) {
		super({ initial });

		const list = arraify(accessories);

		const infoPages = list.map(accessory => new PandoraEmbed()
			.setTitle(`${l(accessory.name)} (${accessory.grade}★ ${accessory.type})`)
			.setThumbnail(imageUrl(`accessories/${accessory.image}`))
			.setDescription(l(accessory.description))
			.addField('Rarity', capitalizeFirstLetter(accessory.rarity), true)
			.addField('Options', `up to ${accessory.maxOptions}`, true)
			.addField('Sell price', `${toClearNumber(accessory.sellPrice)}${config.emojis.gold}`, true)
			.addField('Extract', `${toClearNumber(accessory.extractAntimatter)} antimatter`, true)
			.toEmbed());

		// All accessories currently roll from the same pool, so list each option once
		const options = [...new Map(list.flatMap(a => a.options).map(o => [o.id, o])).values()];

		// Pack whole options into pages by size, an option's fields never split across pages
		const pagesFields: IField[][] = [];
		let current: IField[] = [];
		let currentChars = OPTIONS_TITLE.length;

		for (const fields of options.map(optionFields)) {
			const chars = fields.reduce((sum, f) => sum + f.name.length + f.value.length, 0);

			if (current.length && (
				currentChars + chars > PAGE_CHARS_LIMIT || current.length + fields.length > PAGE_FIELDS_LIMIT
			)) {
				pagesFields.push(current);
				current = [];
				currentChars = OPTIONS_TITLE.length;
			}

			current.push(...fields);
			currentChars += chars;
		}

		if (current.length) pagesFields.push(current);

		const optionPages = pagesFields.map((fields) => {
			const page = new PandoraEmbed().setTitle(OPTIONS_TITLE);

			for (const { name, value } of fields) {
				page.addField(name, value);
			}

			return page.toEmbed();
		});

		this.setArray([...infoPages, ...optionPages]);
	}
}
