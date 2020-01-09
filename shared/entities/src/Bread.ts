import {
	autoserializeAs, autoserialize, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { registerSerializer } from './Serializer';

export type BreadRarity = 'rare' | 'epic' | 'legendary' | 'common';

export class Bread {
	@autoserialize public readonly id: string;
	@autoserialize public readonly name: string;
	@autoserialize public readonly rarity: BreadRarity;
	@autoserialize public readonly value: number;
	@autoserializeAs('great_chance') public readonly greatChance: number;
	@autoserialize public readonly grade: number;
	@autoserialize public readonly image: string;
	@autoserializeAs('sell_cost') public readonly sellCost: number;

	constructor(
		id: string, name: string, rarity: BreadRarity, value: number, greatChance: number, grade: number,
		image: string, sellCost: number
	) {
		this.id = id;
		this.name = name;
		this.rarity = rarity;
		this.value = value;
		this.greatChance = greatChance;
		this.grade = grade;
		this.image = image;
		this.sellCost = sellCost;
	}
}

registerDeserializer(Bread, (input: string) => Deserialize(JSON.parse(input), Bread));
registerSerializer(Bread, (input: Bread | Bread[]) => Serialize(input, Bread));

export type Breads = Array<Bread>;
