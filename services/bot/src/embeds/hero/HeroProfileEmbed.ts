import { HeroClassColors } from '@cquest/entities';
import { translate as l } from '@cquest/data-provider';

import { capitalizeFirstLetter, imageUrl } from '../../util/functions';

import PaginationEmbed from '../PaginationEmbed';
import PandoraEmbed from '../PandoraEmbed';

import IHeroEmbedConstructorOptions from './IHeroEmbedConstructorOptions';

export default class HeroProfileEmbed extends PaginationEmbed {
	constructor({ initial, hero }: IHeroEmbedConstructorOptions) {
		super({ initial });

		const form = hero.forms[hero.forms.length - 1];
		const { profile } = hero;

		if (!profile) throw new Error(`Hero ${hero.id} has no profile`);

		const embed = new PandoraEmbed()
			.setTitle(`${l(form.name)} (${form.star}★)`)
			.setThumbnail(imageUrl(`heroes/${form.image}`))
			.setColor(HeroClassColors[hero.clazz])
			.setDescription(l(profile.notes))
			.addField('Gender', capitalizeFirstLetter(hero.gender), true)
			// Usually plain values ("19", "6/10"), but unknown ones are the TEXT_PROFILE_UNKNOWN key
			.addField('Age', l(profile.age), true)
			.addField('Birthday', l(profile.birthday), true)
			.addField('Hobby', l(profile.hobby))
			.addField('Likes', l(profile.likes))
			.addField('Hates', l(profile.hates))
			.addField('Oztalk', profile.oztalk ? 'Yes' : 'No', true);

		this.setArray([embed.toEmbed()]);
	}
}
