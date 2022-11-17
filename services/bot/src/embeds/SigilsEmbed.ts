import { Sigil } from '@cquest/entities';
import { sigils, translate as l } from '@cquest/data-provider';

import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

import {
	statsToString, imageUrl, capitalizeFirstLetter, toClearNumber, arraify
} from '../util/functions';
import config from '../config';

interface ISigilsEmbedOptions {
	initial: InitialMessageSource;
	sigs: Sigil | Sigil[];
}

export default class SigilsEmbed extends PaginationEmbed {
	constructor({ initial, sigs }: ISigilsEmbedOptions) {
		super({ initial });

		const embeds = arraify(sigs).map((sigil) => {
			const embed = new PandoraEmbed()
				.setDescription(l(sigil.description))
				.setTitle(`${l(sigil.name)} (${sigil.grade}★)`)
				.setThumbnail(imageUrl(`sigils/${sigil.image}`));

			embed.addField('Stats', statsToString(sigil.stats), true);

			if (sigil.set) {
				const otherPiece = sigils.list().find(s => s.ingameId === sigil.set?.pair) as Sigil;

				embed
					.addField('Set effect', l(sigil.set.effect), true)
					.addField('Other piece', l(otherPiece?.name), true)
					.addField('Other piece stats', statsToString(otherPiece.stats), true)
					.setFooter(`Set: ${l(sigil.set.name)}`);
			}

			return embed.addBlankField()
				.addField('Sell price', `${toClearNumber(sigil.sellCost)}${config.emojis.gold}`, true)
				.addField('Extract cost', `${toClearNumber(sigil.extractCost)}${config.emojis.gold}`, true)
				.addField('Rarity', capitalizeFirstLetter(sigil.rarity), true)
				.toEmbed();
		});

		this.setArray(embeds).showPageIndicator(false);
	}
}
