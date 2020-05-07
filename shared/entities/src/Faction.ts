import {
	autoserialize, autoserializeAs, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { registerSerializer } from './Serializer';

export interface IFactionOptions {
	id: string;
	name: string;
	image: string;
	ingameId: string;
}

export class Faction {
	@autoserialize public readonly id: string;
	@autoserialize public readonly name: string;
	@autoserialize public readonly image: string;
	@autoserializeAs('ingame_id') public readonly ingameId: string;

	constructor(options: IFactionOptions) {
		this.id = options.id;
		this.name = options.name;
		this.image = options.image;
		this.ingameId = options.ingameId;
	}
}

registerDeserializer(Faction, (input: string) => Deserialize(JSON.parse(input), Faction));
registerSerializer(Faction, (input: Faction | Faction[]) => Serialize(input, Faction));

export type Factions = Array<Faction>;
