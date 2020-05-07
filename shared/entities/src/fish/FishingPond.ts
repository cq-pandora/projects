import { autoserializeAs, autoserialize, Deserialize } from 'cerialize';

import { registerDeserializer } from '../Deserializer';
import { FishReward } from './FishReward';
import { FishHabitat } from './Fish';

export interface IFishingPondOptions {
	id: string;
	name: string;
	description: string;
	minFR: number;
	fish: Array<string>;
	junk: Array<string>;
	hero: Array<string>;
	habitat: FishHabitat;
	boss: string;
	reward: FishReward;
	background: string;
}

export class FishingPond {
	@autoserialize public readonly id: string;
	@autoserialize public readonly name: string;
	@autoserialize public readonly description: string;
	@autoserializeAs('min_fr') public readonly minFR: number;
	@autoserialize public readonly fish: Array<string>;
	@autoserialize public readonly junk: Array<string>;
	@autoserialize public readonly hero: Array<string>;
	@autoserialize public readonly habitat: FishHabitat;
	@autoserialize public readonly boss: string;
	@autoserializeAs(FishReward) public readonly reward: FishReward;
	@autoserialize public readonly background: string;

	constructor(options: IFishingPondOptions) {
		this.id = options.id;
		this.name = options.name;
		this.description = options.description;
		this.minFR = options.minFR;
		this.fish = options.fish;
		this.junk = options.junk;
		this.hero = options.hero;
		this.habitat = options.habitat;
		this.boss = options.boss;
		this.reward = options.reward;
		this.background = options.background;
	}
}

registerDeserializer(FishingPond, (input: string) => Deserialize(JSON.parse(input), FishingPond));

export type FishingPonds = Array<FishingPond>;
