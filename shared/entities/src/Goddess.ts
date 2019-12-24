import { autoserialize, autoserializeAs } from 'cerialize';

export class Goddess {
	@autoserialize public readonly id: string;
	@autoserialize public readonly name: string;
	@autoserialize public readonly image: string;
	@autoserializeAs('skill_name') public readonly skillName: string;
	@autoserializeAs('skill_description') public readonly skillDescription: string;
	@autoserializeAs('ingame_id') public readonly ingameId: string;

	constructor(
		id: string, name: string, image: string, skillName: string, skillDescription: string, ingameId: string
	) {
		this.id = id;
		this.name = name;
		this.image = image;
		this.skillName = skillName;
		this.skillDescription = skillDescription;
		this.ingameId = ingameId;
	}
}

export type Goddesses = Array<Goddess>;
