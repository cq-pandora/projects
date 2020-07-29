import { Message } from 'discord.js';

import { Sigil } from '@cquest/entities';
import { sigils } from '@cquest/data-provider';

import PaginationEmbed from './PaginationEmbed';
import { l, LocalizableMessageEmbed } from './LocalizableMessageEmbed';

import {
	statsToString, imageUrl, capitalizeFirstLetter, toClearNumber, arraify
} from '../util/functions';
import config from '../config';

interface ISigilsEmbedOptions {
	initialMessage: Message;
	sigs: Sigil | Sigil[];
	locales: string[];
}

export default class SigilsEmbed extends PaginationEmbed {
	constructor({ initialMessage, sigs, locales }: ISigilsEmbedOptions) {
		super({
			initialMessage,
			locales,
		});

		const embeds = arraify(sigs).map((sigil) => {
			const embed = new LocalizableMessageEmbed()
				.setDescription(l(sigil.description))
				.setTitle(l`${sigil.name} (${sigil.grade}★)`)
				.setThumbnail(imageUrl(`sigils/${sigil.image}`));

			embed.addField('Stats', statsToString(sigil.stats), true);

			if (sigil.set) {
				const otherPiece = sigils.list().find(s => s.ingameId === sigil.set?.pair) as Sigil;

				embed
					.addField('Set effect', l(sigil.set.effect), true)
					.addField('Other piece', l(otherPiece?.name), true)
					.addField('Other piece stats', statsToString(otherPiece.stats), true)
					.setFooter(l`Set: ${sigil.set.name}`);
			}

			return embed.addBlankField()
				.addField('Sell price', `${toClearNumber(sigil.sellCost)}${config.emojis.gold}`, true)
				.addField('Extract cost', `${toClearNumber(sigil.extractCost)}${config.emojis.gold}`, true)
				.addField('Rarity', capitalizeFirstLetter(sigil.rarity), true);
		});

		this.setArray(embeds).showPageIndicator(false);
	}
}
