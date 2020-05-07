import { autoserializeAs, autoserialize } from 'cerialize';

export interface ISpSkillFormOptions {
	level: number;
	description: string;
	shortDescription: string;
	image: string;
}

export class SpSkillForm {
	@autoserialize public readonly level: number;
	@autoserialize public readonly description: string;
	@autoserializeAs('short_description') public readonly shortDescription: string;
	@autoserialize public readonly image: string;

	constructor(options: ISpSkillFormOptions) {
		this.level = options.level;
		this.description = options.description;
		this.shortDescription = options.shortDescription;
		this.image = options.image;
	}
}
