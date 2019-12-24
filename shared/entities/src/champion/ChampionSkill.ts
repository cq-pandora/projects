import { autoserialize } from 'cerialize';

export default class ChampionSkill {
	@autoserialize public readonly id: string;
	@autoserialize public readonly name: string;
	@autoserialize public readonly description: string;
	@autoserialize public readonly image: string;
	@autoserialize public readonly grade: number;

	constructor(id: string, name: string, description: string, image: string, grade: number) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.image = image;
		this.grade = grade;
	}
}
