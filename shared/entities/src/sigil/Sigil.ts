import {
	autoserialize, autoserializeAs, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from '../Deserializer';
import { SigilStats } from './SigilStats';
import { SigilPair } from './SigilPair';
import { registerSerializer } from '../Serializer';

export type SigilRarity = 'common' | 'rare' | 'epic' | 'set' | 'unique';

export interface ISigilOptions {
	id: string;
	ingameId: string;
	name: string;
	description: string;
	image: string;
	grade: number;
	rarity: SigilRarity;
	sellCost: number;
	extractCost: number;
	stats: SigilStats;
	set?: SigilPair;
}

export class Sigil {
	@autoserialize public readonly id!: string;
	@autoserializeAs('ingame_id') public readonly ingameId!: string;
	@autoserialize public readonly name!: string;
	@autoserialize public readonly description!: string;
	@autoserialize public readonly image!: string;
	@autoserialize public readonly grade!: number;
	@autoserialize public readonly rarity!: SigilRarity;
	@autoserializeAs('sell_cost') public readonly sellCost!: number;
	@autoserializeAs('extract_cost') public readonly extractCost!: number;
	@autoserializeAs(SigilStats) public readonly stats!: SigilStats;
	@autoserializeAs(SigilPair) public readonly set?: SigilPair;

	constructor(options: ISigilOptions) {
		if (!options) return; // only for tests

		this.id = options.id;
		this.ingameId = options.ingameId;
		this.name = options.name;
		this.description = options.description;
		this.image = options.image;
		this.grade = options.grade;
		this.rarity = options.rarity;
		this.sellCost = options.sellCost;
		this.extractCost = options.extractCost;
		this.stats = options.stats;
		this.set = options.set;
	}
}

registerDeserializer(Sigil, (input: string) => Deserialize(JSON.parse(input), Sigil));
registerSerializer(Sigil, (input: Sigil | Sigil[]) => Serialize(input, Sigil));
