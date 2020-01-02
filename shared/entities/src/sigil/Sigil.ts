import { autoserialize, autoserializeAs, Deserialize } from 'cerialize';

import { registerDeserializer } from '../Deserializer';
import SigilStats from './SigilStats';
import SigilPair from './SigilPair';

export type SigilRarity = 'common' | 'rare' | 'epic' | 'set' | 'unique';

export class Sigil {
	@autoserialize public readonly id: string;
	@autoserializeAs('ingame_id') public readonly ingameId: string;
	@autoserialize public readonly name: string;
	@autoserialize public readonly description: string;
	@autoserialize public readonly image: string;
	@autoserialize public readonly grade: number;
	@autoserialize public readonly rarity: SigilRarity;
	@autoserializeAs('sell_cost') public readonly sellCost: number;
	@autoserializeAs('extract_cost') public readonly extractCost: number;
	@autoserializeAs(SigilStats) public readonly stats: SigilStats;
	@autoserializeAs(SigilPair) public readonly set?: SigilPair;

	constructor(
		id: string, ingameId: string, name: string, description: string, image: string, grade: number,
		rarity: SigilRarity, sellCost: number, extractCost: number, stats: SigilStats, set?: SigilPair
	) {
		this.id = id;
		this.ingameId = ingameId;
		this.name = name;
		this.description = description;
		this.image = image;
		this.grade = grade;
		this.rarity = rarity;
		this.sellCost = sellCost;
		this.extractCost = extractCost;
		this.stats = stats;
		this.set = set;
	}
}

registerDeserializer(Sigil, (input: string) => Deserialize(JSON.parse(input), Sigil));
