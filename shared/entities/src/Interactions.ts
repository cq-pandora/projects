import {
	autoserializeAs, autoserialize, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { registerSerializer } from './Serializer';

export interface IInteractionActorOptions {
	id: string;
	text: string;
	imageKey: string;
}

export class InteractionActor {
	@autoserialize public readonly id!: string;
	@autoserialize public readonly text!: string;
	@autoserialize public readonly imageKey!: string;

	constructor(options: IInteractionActorOptions) {
		if (!options) return; // only for tests

		this.id = options.id;
		this.text = options.text;
		this.imageKey = options.imageKey;
	}
}

interface IInteractionOptions {
	id: string;
	actors: InteractionActor[];
}

export class Interaction {
	@autoserialize public readonly id!: string;
	@autoserializeAs(InteractionActor) public readonly actors!: InteractionActor[];

	constructor(options: IInteractionOptions) {
		if (!options) return; // only for tests

		this.id = options.id;
		this.actors = options.actors;
	}
}

export type Interactions = Interaction[];

registerSerializer(Interaction, (input: Interaction | Interaction[]) => Serialize(input, Interaction));
registerDeserializer(Interaction, (input: string) => Deserialize(JSON.parse(input), Interaction));
