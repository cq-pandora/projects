import {
	autoserializeAs, autoserialize, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { registerSerializer } from './Serializer';

export class InteractionActor {
	@autoserialize public readonly id: string;
	@autoserialize public readonly text: string;
	@autoserialize public readonly skin?: string;

	constructor(id: string, text: string, skin?: string) {
		this.id = id;
		this.text = text;
		this.skin = skin;
	}
}

export class Interaction {
	@autoserialize public readonly id: string;
	@autoserializeAs(InteractionActor) public readonly actors: InteractionActor[];

	constructor(id: string, actors: InteractionActor[]) {
		this.id = id;
		this.actors = actors;
	}
}

export type Interactions = Interaction[];

registerSerializer(Interaction, (input: Interaction | Interaction[]) => Serialize(input, Interaction));
registerDeserializer(Interaction, (input: string) => Deserialize(JSON.parse(input), Interaction));
