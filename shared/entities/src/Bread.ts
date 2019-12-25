import { autoserializeAs, autoserialize, Deserialize } from 'cerialize';

import { registerDeserializer } from './Deserializer';

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

registerDeserializer(Bread, (input: string) => Deserialize(input, Bread));

export type Breads = Array<Bread>;
