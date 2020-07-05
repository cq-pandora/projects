import {
	autoserializeAs, autoserialize, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { registerSerializer } from './Serializer';
import { IStatsHolder } from './interfaces';

export interface IScarecrowOptions {
	id: string;
	name: string;
	description: string;
	image: string;
	priority: number;
	accuracy: number;
	armor: number;
	armorPenetration: number;
	atkPower: number;
	critChance: number;
	critChanceReduction: number;
	critDmg: number;
	dmgReduction: number;
	evasion: number;
	hp: number;
	lifesteal: number;
	resistance: number;
	resistancePenetration: number;
}

export class Scarecrow implements IStatsHolder {
	readonly all: number = -1;
	@autoserialize public readonly id!: string;

	@autoserialize public readonly name!: string;
	@autoserialize public readonly description!: string;
	@autoserialize public readonly image!: string;
	@autoserialize public readonly priority!: number;

	@autoserialize public readonly accuracy!: number;
	@autoserialize public readonly armor!: number;
	@autoserializeAs('armor_pen') public readonly armorPenetration!: number;
	@autoserializeAs('atk_power') public readonly atkPower!: number;
	@autoserializeAs('crit_chance') public readonly critChance!: number;
	@autoserializeAs('crit_chance_reduction') public readonly critChanceReduction!: number;
	@autoserializeAs('crit_dmg') public readonly critDmg!: number;
	@autoserializeAs('dmg_reduction') public readonly dmgReduction!: number;
	@autoserialize public readonly evasion!: number;
	@autoserialize public readonly hp!: number;
	@autoserialize public readonly lifesteal!: number;
	@autoserialize public readonly resistance!: number;
	@autoserializeAs('resistance_pen') public readonly resistancePenetration!: number;

	constructor(options: IScarecrowOptions) {
		if (!options) return; // for tests and serializer

		this.id = options.id;
		this.name = options.name;
		this.description = options.description;
		this.image = options.image;
		this.priority = options.priority;
		this.accuracy = options.accuracy;
		this.armor = options.armor;
		this.armorPenetration = options.armorPenetration;
		this.atkPower = options.atkPower;
		this.critChance = options.critChance;
		this.critChanceReduction = options.critChanceReduction;
		this.critDmg = options.critDmg;
		this.dmgReduction = options.dmgReduction;
		this.evasion = options.evasion;
		this.hp = options.hp;
		this.lifesteal = options.lifesteal;
		this.resistance = options.resistance;
		this.resistancePenetration = options.resistancePenetration;
	}
}

registerDeserializer(Scarecrow, (input: string) => Deserialize(JSON.parse(input), Scarecrow));
registerSerializer(Scarecrow, (input: Scarecrow | Scarecrow[]) => Serialize(input, Scarecrow));
