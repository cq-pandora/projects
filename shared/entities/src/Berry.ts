import { autoserializeAs, autoserialize, Deserialize } from 'cerialize';

import { registerDeserializer } from './Deserializer';

import { HeroStats } from './hero';

export type BerryRarity = 'rare' | 'epic' | 'legendary' | 'common';

export type BerryCategory = 'util' | 'all' | 'def' | 'atk';

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

	constructor(
		id: string, name: string, rarity: BerryRarity, targetStat: HeroStats, isPercentage: boolean, value: number,
		greatChance: number, grade: number, image: string, category: BerryCategory, sellCost: number, eatCost: number
	) {
		this.id = id;
		this.name = name;
		this.rarity = rarity;
		this.targetStat = targetStat;
		this.isPercentage = isPercentage;
		this.value = value;
		this.greatChance = greatChance;
		this.grade = grade;
		this.image = image;
		this.category = category;
		this.sellCost = sellCost;
		this.eatCost = eatCost;
	}
}

registerDeserializer(Berry, (input: string) => Deserialize(input, Berry));

export type Berries = Array<Berry>;
