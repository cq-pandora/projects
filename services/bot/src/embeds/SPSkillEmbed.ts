import { Message } from 'discord.js';
import { SpSkill, HeroClassColors } from '@cquest/entities';

import { imageUrl } from '../util/functions';

import PaginationEmbed from './PaginationEmbed';
import { l, LocalizableMessageEmbed } from './LocalizableMessageEmbed';

interface ISPSkillEmbedOptions {
	initialMessage?: Message;
	skill: SpSkill;
	page: number | undefined;
	locales: string[];
}

export default class SPSkillEmbed extends PaginationEmbed {
	constructor({
		initialMessage,
		skill,
		page,
		locales
	}: ISPSkillEmbedOptions) {
		super({ initialMessage, locales });

		const embeds = skill.forms.map(form => (
			new LocalizableMessageEmbed()
				.setTitle(l`${skill.name} Lvl. ${form.level}`)
				.setDescription(l(form.description))
				.setThumbnail(imageUrl(`skills/${form.image}`))
				.setColor(HeroClassColors[skill.clazz])
		));

		this.setArray(embeds)
			.showPageIndicator(false);

		if (page) {
			this.setPage(page);
		}
	}
}
