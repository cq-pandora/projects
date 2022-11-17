import { SpSkill, HeroClassColors } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import { imageUrl } from '../util/functions';

import PaginationEmbed, { InitialMessageSource } from './PaginationEmbed';
import PandoraEmbed from './PandoraEmbed';

interface ISPSkillEmbedOptions {
	initial: InitialMessageSource;
	skill: SpSkill;
	page: number | undefined;
}

export default class SPSkillEmbed extends PaginationEmbed {
	constructor({ initial, skill, page }: ISPSkillEmbedOptions) {
		super({ initial });

		const embeds = skill.forms.map(form => (
			new PandoraEmbed()
				.setTitle(`${l(skill.name)} Lvl. ${form.level}`)
				.setDescription(l(form.description))
				.setThumbnail(imageUrl(`skills/${form.image}`))
				.setColor(HeroClassColors[skill.clazz])
				.toEmbed()
		));

		this.setArray(embeds)
			.showPageIndicator(false);

		if (page) {
			this.setPage(page);
		}
	}
}
