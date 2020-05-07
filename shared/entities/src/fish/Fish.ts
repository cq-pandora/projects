import {
	autoserializeAs, autoserialize, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from '../Deserializer';
import { FishReward, FishRewards } from './FishReward';
import { registerSerializer } from '../Serializer';

export type FishHabitat = 'sea' | 'freshwater' | 'event';

export type FishType = 'fish' | 'junk' | 'event';

export type FishRank = 'normal' | 'hero' | 'boss' | 'event' | 'eventbox';

export interface IFishOptions {
	id: string;
	name: string;
	description: string;
	habitat: FishHabitat;
	rank: FishRank;
	type: FishType;
	grade: number;
	startsFrom: number;
	image: string;
	exp: number;
	rewards: FishRewards;
}

export class Fish {
	@autoserialize public readonly id: string;
	@autoserialize public readonly name: string;
	@autoserialize public readonly description: string;
	@autoserialize public readonly habitat: FishHabitat;
	@autoserialize public readonly rank: FishRank;
	@autoserialize public readonly type: FishType;
	@autoserialize public readonly grade: number;
	@autoserializeAs('starts_from') public readonly startsFrom: number;
	@autoserialize public readonly image: string;
	@autoserialize public readonly exp: number;
	@autoserializeAs(FishReward) public readonly rewards: FishRewards;

	constructor(options: IFishOptions) {
		this.id = options.id;
		this.name = options.name;
		this.habitat = options.habitat;
		this.rank = options.rank;
		this.type = options.type;
		this.grade = options.grade;
		this.startsFrom = options.startsFrom;
		this.image = options.image;
		this.exp = options.exp;
		this.rewards = options.rewards;
		this.description = options.description;
	}
}

registerDeserializer(Fish, (input: string) => Deserialize(JSON.parse(input), Fish));
registerSerializer(Fish, (input: Fish | Fish[]) => Serialize(input, Fish));

export type Fishes = Array<Fish>;
