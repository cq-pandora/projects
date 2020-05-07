import {
	autoserialize, autoserializeAs, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { registerSerializer } from './Serializer';

export interface IGoddessOptions {
	id: string;
	name: string;
	image: string;
	skillName: string;
	skillDescription: string;
	ingameId: string;
}

export class Goddess {
	@autoserialize public readonly id!: string;
	@autoserialize public readonly name!: string;
	@autoserialize public readonly image!: string;
	@autoserializeAs('skill_name') public readonly skillName!: string;
	@autoserializeAs('skill_description') public readonly skillDescription!: string;
	@autoserializeAs('ingame_id') public readonly ingameId!: string;

	constructor(options: IGoddessOptions) {
		if (!options) return; // only for tests

		this.id = options.id;
		this.name = options.name;
		this.image = options.image;
		this.skillName = options.skillName;
		this.skillDescription = options.skillDescription;
		this.ingameId = options.ingameId;
	}
}

registerDeserializer(Goddess, (input: string) => Deserialize(JSON.parse(input), Goddess));
registerSerializer(Goddess, (input: Goddess | Goddess[]) => Serialize(input, Goddess));

export type Goddesses = Array<Goddess>;
