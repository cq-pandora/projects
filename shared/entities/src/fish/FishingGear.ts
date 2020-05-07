import {
	autoserializeAs, autoserialize, Deserialize, Serialize
} from 'cerialize';

import { registerSerializer } from '../Serializer';
import { registerDeserializer } from '../Deserializer';
import { FishHabitat } from './Fish';

export type FishingGearType = 'item_rod' | 'item_float' | 'item_bait';

export interface IFishingGearOptions {
	id: string;
	name: string;
	description: string;
	type: FishingGearType;
	grade: number;
	habitat: FishHabitat;
	habitatBonus: number;
	power: number;
	bigChance: number;
	biteChance: number;
	eventChance: number;
	currency: string;
	price: number;
	image: string;
}

export class FishingGear {
	@autoserialize public readonly id!: string;
	@autoserialize public readonly name!: string;
	@autoserialize public readonly description!: string;
	@autoserialize public readonly type!: FishingGearType;
	@autoserialize public readonly grade!: number;
	@autoserialize public readonly habitat!: FishHabitat;
	@autoserializeAs('habitat_bonus') public readonly habitatBonus!: number;
	@autoserialize public readonly power!: number;
	@autoserializeAs('big_chance') public readonly bigChance!: number;
	@autoserializeAs('bite_chance') public readonly biteChance!: number;
	@autoserializeAs('event_chance') public readonly eventChance!: number;
	@autoserialize public readonly currency!: string;
	@autoserialize public readonly price!: number;
	@autoserialize public readonly image!: string;

	constructor(options: IFishingGearOptions) {
		if (!options) return; // only for tests

		this.id = options.id;
		this.name = options.name;
		this.type = options.type;
		this.grade = options.grade;
		this.habitat = options.habitat;
		this.habitatBonus = options.habitatBonus;
		this.power = options.power;
		this.bigChance = options.bigChance;
		this.biteChance = options.biteChance;
		this.eventChance = options.eventChance;
		this.currency = options.currency;
		this.price = options.price;
		this.image = options.image;
		this.description = options.description;
	}
}

registerSerializer(FishingGear, (input: FishingGear | FishingGear[]) => Serialize(input, FishingGear));
registerDeserializer(FishingGear, (input: string) => Deserialize(JSON.parse(input), FishingGear));

export type FishingGears = Array<FishingGear>;
