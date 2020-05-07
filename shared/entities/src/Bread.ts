import {
	autoserializeAs, autoserialize, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { registerSerializer } from './Serializer';

export type BreadRarity = 'rare' | 'epic' | 'legendary' | 'common';

export interface IBreadOptions {
	id: string;
	name: string;
	rarity: BreadRarity;
	value: number;
	greatChance: number;
	grade: number;
	image: string;
	sellCost: number;
}

export class Bread {
	@autoserialize public readonly id: string;
	@autoserialize public readonly name: string;
	@autoserialize public readonly rarity: BreadRarity;
	@autoserialize public readonly value: number;
	@autoserializeAs('great_chance') public readonly greatChance: number;
	@autoserialize public readonly grade: number;
	@autoserialize public readonly image: string;
	@autoserializeAs('sell_cost') public readonly sellCost: number;

	constructor(options: IBreadOptions) {
		this.id = options.id;
		this.name = options.name;
		this.rarity = options.rarity;
		this.value = options.value;
		this.greatChance = options.greatChance;
		this.grade = options.grade;
		this.image = options.image;
		this.sellCost = options.sellCost;
	}
}

registerDeserializer(Bread, (input: string) => Deserialize(JSON.parse(input), Bread));
registerSerializer(Bread, (input: Bread | Bread[]) => Serialize(input, Bread));

export type Breads = Array<Bread>;
