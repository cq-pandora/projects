import { autoserialize } from 'cerialize';

export interface IChampionSkillOptions {
	id: string;
	name: string;
	description: string;
	image: string;
	grade: number;
}

export class ChampionSkill {
	@autoserialize public readonly id!: string;
	@autoserialize public readonly name!: string;
	@autoserialize public readonly description!: string;
	@autoserialize public readonly image!: string;
	@autoserialize public readonly grade!: number;

	constructor(options: IChampionSkillOptions) {
		if (!options) return; // only for tests

		this.id = options.id;
		this.name = options.name;
		this.description = options.description;
		this.image = options.image;
		this.grade = options.grade;
	}
}
