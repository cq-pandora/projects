import { HeroForm } from '@cquest/entities';

import chunk from './chunk';
import { translate } from '../../cq-data';
import config from '../../config';

const {
	miniContract, miniPromotable, miniBrown, miniEvent, miniSupply
} = config.emojis;

export default (pull: HeroForm[], canBeGuaranteed = true): string[][] => chunk(
	pull.map(
		(form, idx) => {
			if (form.star < 4) {
				return `${miniBrown}${translate(form.name)} (${form.star}★)`;
			}

			switch (form.hero.type) {
				case 'contract':
					return `**${miniContract}${translate(form.name)} (${form.star}★)${((idx + 1) % 10 && canBeGuaranteed) ? '**' : ' (Guaranteed)**'}`;
				case 'promotable':
					return `*${miniPromotable}${translate(form.name)} (${form.star}★)*`;
				case 'collab':
				case 'secret':
					return `*${miniEvent}${translate(form.name)} (${form.star}★)*`;
				default:
					return `*${miniSupply}${translate(form.name)} (${form.star}★)*`;
			}
		}
	),
	10
);
