import { autoserialize, autoserializeAs } from 'cerialize';

export default class Faction {
	@autoserialize public readonly id: string;
	@autoserialize public readonly name: string;
	@autoserialize public readonly image: string;
	@autoserializeAs('ingame_id') public readonly ingameId: string;

	constructor(id: string, name: string, image: string, ingameId: string) {
		this.id = id;
		this.name = name;
		this.image = image;
		this.ingameId = ingameId;
	}
}

export type Factions = Array<Faction>;
