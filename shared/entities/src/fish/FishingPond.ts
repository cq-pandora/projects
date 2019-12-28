import { autoserializeAs, autoserialize, Deserialize } from 'cerialize';

import { registerDeserializer } from '../Deserializer';
import { FishReward } from './FishReward';
import { FishHabitat } from './Fish';

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

	constructor(
		id: string, name: string, description: string, minFR: number, fish: Array<string>, junk: Array<string>,
		hero: Array<string>, habitat: FishHabitat, boss: string, reward: FishReward, background: string
	) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.minFR = minFR;
		this.fish = fish;
		this.junk = junk;
		this.hero = hero;
		this.habitat = habitat;
		this.boss = boss;
		this.reward = reward;
		this.background = background;
	}
}

registerDeserializer(FishingPond, (input: string) => Deserialize(JSON.parse(input), FishingPond));

export type FishingPonds = Array<FishingPond>;
