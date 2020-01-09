import {
	autoserialize, autoserializeAs, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { registerSerializer } from './Serializer';

export class Faction {
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

registerDeserializer(Faction, (input: string) => Deserialize(JSON.parse(input), Faction));
registerSerializer(Faction, (input: Faction | Faction[]) => Serialize(input, Faction));

export type Factions = Array<Faction>;
