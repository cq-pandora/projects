import {
	autoserializeAs, autoserialize, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { registerSerializer } from './Serializer';

// Total War accessories (added Nov 2022)
export type AccessoryType = 'earring' | 'necklace';
export type AccessoryOptionType = 'stat' | 'effect';

export interface IAccessoryOptionLevelOptions {
	level: number;
	value: number;
	description: string;
	shortDescription: string;
}

export class AccessoryOptionLevel {
	@autoserialize public readonly level!: number;
	@autoserialize public readonly value!: number;
	@autoserialize public readonly description!: string;
	@autoserializeAs('short_description') public readonly shortDescription!: string;

	constructor(options: IAccessoryOptionLevelOptions) {
		if (!options) return; // for tests and serializer

		this.level = options.level;
		this.value = options.value;
		this.description = options.description;
		this.shortDescription = options.shortDescription;
	}
}

export interface IAccessoryOptionOptions {
	id: string;
	name: string;
	type: AccessoryOptionType;
	levels: AccessoryOptionLevel[];
}

export class AccessoryOption {
	@autoserialize public readonly id!: string;
	@autoserialize public readonly name!: string;
	@autoserialize public readonly type!: AccessoryOptionType;
	@autoserializeAs(AccessoryOptionLevel) public readonly levels!: AccessoryOptionLevel[];

	constructor(options: IAccessoryOptionOptions) {
		if (!options) return; // for tests and serializer

		this.id = options.id;
		this.name = options.name;
		this.type = options.type;
		this.levels = options.levels;
	}
}

export interface IAccessoryOptions {
	id: string;
	type: AccessoryType;
	name: string;
	description: string;
	image: string;
	grade: number;
	rarity: string;
	maxOptions: number;
	sellPrice: number;
	extractAntimatter: number;
	options: AccessoryOption[];
}

export class Accessory {
	@autoserialize public readonly id!: string;
	@autoserialize public readonly type!: AccessoryType;
	@autoserialize public readonly name!: string;
	@autoserialize public readonly description!: string;
	@autoserialize public readonly image!: string;
	@autoserialize public readonly grade!: number;
	@autoserialize public readonly rarity!: string;
	@autoserializeAs('max_options') public readonly maxOptions!: number;
	@autoserializeAs('sell_price') public readonly sellPrice!: number;
	@autoserializeAs('extract_antimatter') public readonly extractAntimatter!: number;
	@autoserializeAs(AccessoryOption) public readonly options!: AccessoryOption[];

	constructor(options: IAccessoryOptions) {
		if (!options) return; // for tests and serializer

		this.id = options.id;
		this.type = options.type;
		this.name = options.name;
		this.description = options.description;
		this.image = options.image;
		this.grade = options.grade;
		this.rarity = options.rarity;
		this.maxOptions = options.maxOptions;
		this.sellPrice = options.sellPrice;
		this.extractAntimatter = options.extractAntimatter;
		this.options = options.options;
	}
}

registerDeserializer(Accessory, (input: string) => Deserialize(JSON.parse(input), Accessory));
registerSerializer(Accessory, (input: Accessory | Accessory[]) => Serialize(input, Accessory));
