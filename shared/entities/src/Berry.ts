import {
	autoserializeAs, autoserialize, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from './Deserializer';

import { HeroStats } from './hero';
import { registerSerializer } from './Serializer';

export type BerryRarity = 'rare' | 'epic' | 'legendary' | 'common';

export type BerryCategory = 'util' | 'all' | 'def' | 'atk';

export interface IBerryOptions {
	id: string;
	name: string;
	rarity: BerryRarity;
	targetStat: HeroStats;
	isPercentage: boolean;
	value: number;
	greatChance: number;
	grade: number;
	image: string;
	category: BerryCategory;
	sellCost: number;
	eatCost: number;
}

export class Berry {
	@autoserialize public readonly id: string;
	@autoserialize public readonly name: string;
	@autoserialize public readonly rarity: BerryRarity;
	@autoserialize public readonly targetStat: HeroStats;
	@autoserializeAs('is_percentage') public readonly isPercentage: boolean;
	@autoserialize public readonly value: number;
	@autoserializeAs('great_chance') public readonly greatChance: number;
	@autoserialize public readonly grade: number;
	@autoserialize public readonly image: string;
	@autoserialize public readonly category: BerryCategory;
	@autoserializeAs('sell_cost') public readonly sellCost: number;
	@autoserializeAs('eat_cost') public readonly eatCost: number;

	constructor(options: IBerryOptions) {
		this.id = options.id;
		this.name = options.name;
		this.rarity = options.rarity;
		this.targetStat = options.targetStat;
		this.isPercentage = options.isPercentage;
		this.value = options.value;
		this.greatChance = options.greatChance;
		this.grade = options.grade;
		this.image = options.image;
		this.category = options.category;
		this.sellCost = options.sellCost;
		this.eatCost = options.eatCost;
	}
}

registerDeserializer(Berry, (input: string) => Deserialize(JSON.parse(input), Berry));
registerSerializer(Berry, (input: Berry | Berry[]) => Serialize(input, Berry));

export type Berries = Array<Berry>;
