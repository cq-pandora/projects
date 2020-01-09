import {
	autoserializeAs, autoserialize, Deserialize, Serialize
} from 'cerialize';

import { registerSerializer } from '../Serializer';
import { registerDeserializer } from '../Deserializer';
import { FishHabitat } from './Fish';

export type FishingGearType = 'item_rod' | 'item_float' | 'item_bait';

export class FishingGear {
	@autoserialize public readonly id: string;
	@autoserialize public readonly name: string;
	@autoserialize public readonly description: string;
	@autoserialize public readonly type: FishingGearType;
	@autoserialize public readonly grade: number;
	@autoserialize public readonly habitat: FishHabitat;
	@autoserializeAs('habitat_bonus') public readonly habitatBonus: number;
	@autoserialize public readonly power: number;
	@autoserializeAs('big_chance') public readonly bigChance: number;
	@autoserializeAs('bite_chance') public readonly biteChance: number;
	@autoserializeAs('event_chance') public readonly eventChance: number;
	@autoserialize public readonly currency: string;
	@autoserialize public readonly price: number;
	@autoserialize public readonly image: string;

	constructor(
		id: string, name: string, type: FishingGearType, grade: number, habitat: FishHabitat, habitatBonus: number,
		power: number, bigChance: number, biteChance: number, eventChance: number, currency: string, price: number,
		image: string, description: string
	) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.grade = grade;
		this.habitat = habitat;
		this.habitatBonus = habitatBonus;
		this.power = power;
		this.bigChance = bigChance;
		this.biteChance = biteChance;
		this.eventChance = eventChance;
		this.currency = currency;
		this.price = price;
		this.image = image;
		this.description = description;
	}
}

registerSerializer(FishingGear, (input: FishingGear | FishingGear[]) => Serialize(input, FishingGear));
registerDeserializer(FishingGear, (input: string) => Deserialize(JSON.parse(input), FishingGear));

export type FishingGears = Array<FishingGear>;
