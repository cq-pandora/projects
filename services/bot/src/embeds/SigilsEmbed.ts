import { MessageEmbed, Message } from 'discord.js';
import { Sigil } from '@pandora/entities';

import PaginationEmbed from './PaginationEmbed';
import {
	statsToString, imageUrl, capitalizeFirstLetter, toClearNumber, arraify
} from '../util/functions';
import { translate, sigils } from '../cq-data';
import config from '../config';

export default class SigilsEmbed extends PaginationEmbed {
	constructor(initialMessage: Message, sigs: Sigil | Sigil[]) {
		super(initialMessage);

		const embeds = arraify(sigs).map((sigil) => {
			const embed = new MessageEmbed()
				.setDescription(translate(sigil.description))
				.setTitle(`${translate(sigil.name)} (${sigil.grade}★)`)
				.setThumbnail(imageUrl(`sigils/${sigil.image}`));

			embed.addField('Stats', statsToString(sigil.stats), true);

			if (sigil.set) {
				const otherPiece = sigils.list().find(s => s.ingameId === sigil.set?.pair) as Sigil;

				embed
					.addField('Set effect', translate(sigil.set.effect), true)
					.addField('Other piece', translate(otherPiece?.name), true)
					.addField('Other piece stats', statsToString(otherPiece.stats), true)
					.setFooter(`Set: ${translate(sigil.set.name)}`);
			}

			return embed.addBlankField()
				.addField('Sell price', `${toClearNumber(sigil.sellCost)}${config.emojis.gold}`, true)
				.addField('Extract cost', `${toClearNumber(sigil.extractCost)}${config.emojis.gold}`, true)
				.addField('Rarity', capitalizeFirstLetter(sigil.rarity), true);
		});

		this.setArray(embeds).showPageIndicator(false);
	}
}
