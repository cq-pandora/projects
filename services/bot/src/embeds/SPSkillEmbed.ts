import { MessageEmbed, Message } from 'discord.js';
import { SpSkill, HeroClassColors } from '@pandora/entities';

import PaginationEmbed from './PaginationEmbed';
import { imageUrl } from '../util/functions';
import { translate } from '../cq-data';

export default class SPSkillEmbed extends PaginationEmbed {
	constructor(initialMessage: Message, skill: SpSkill, page: number | undefined) {
		super(initialMessage);

		const embeds = skill.forms.map(form => (
			new MessageEmbed()
				.setTitle(`${translate(skill.name)} Lvl. ${form.level}`)
				.setDescription(translate(form.description))
				.setThumbnail(imageUrl(`skills/${form.image}`))
		));

		this.setArray(embeds)
			.showPageIndicator(false)
			.setColor(HeroClassColors[skill.clazz]);

		if (page) {
			this.setPage(page);
		}
	}
}
