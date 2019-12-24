import { autoserializeAs, autoserialize } from 'cerialize';

export default class SpSkillForm {
	@autoserialize public readonly level: number;
	@autoserialize public readonly description: string;
	@autoserializeAs('short_description') public readonly shortDescription: string;
	@autoserialize public readonly image: string;

	constructor(level: number, description: string, shortDescription: string, image: string) {
		this.level = level;
		this.description = description;
		this.shortDescription = shortDescription;
		this.image = image;
	}
}
