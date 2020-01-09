import {
	autoserializeAs, autoserialize, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { IStatsHolder } from './interfaces';
import { registerSerializer } from './Serializer';

export class Boss implements IStatsHolder {
	readonly all: number = -1;
	@autoserialize public readonly id: string;
	@autoserialize public readonly name: string;
	@autoserialize public readonly image: string;
	@autoserialize public readonly accuracy: number;
	@autoserialize public readonly armor: number;
	@autoserializeAs('armor_pen') public readonly armorPenetration: number;
	@autoserializeAs('atk_power') public readonly atkPower: number;
	@autoserializeAs('crit_chance') public readonly critChance: number;
	@autoserializeAs('crit_chance_reduction') public readonly critChanceReduction: number;
	@autoserializeAs('crit_dmg') public readonly critDmg: number;
	@autoserializeAs('dmg_reduction') public readonly dmgReduction: number;
	@autoserialize public readonly evasion: number;
	@autoserialize public readonly hp: number;
	@autoserialize public readonly lifesteal: number;
	@autoserialize public readonly resistance: number;
	@autoserializeAs('resistance_pen') public readonly resistancePenetration: number;

	constructor(
		id: string, name: string, image: string, accuracy: number, armor: number, armorPenetration: number,
		atkPower: number, critChance: number, critChanceReduction: number, critDmg: number, dmgReduction: number,
		evasion: number, hp: number, lifesteal: number, resistance: number, resistancePenetration: number
	) {
		this.id = id;
		this.name = name;
		this.image = image;
		this.accuracy = accuracy;
		this.armor = armor;
		this.armorPenetration = armorPenetration;
		this.atkPower = atkPower;
		this.critChance = critChance;
		this.critChanceReduction = critChanceReduction;
		this.critDmg = critDmg;
		this.dmgReduction = dmgReduction;
		this.evasion = evasion;
		this.hp = hp;
		this.lifesteal = lifesteal;
		this.resistance = resistance;
		this.resistancePenetration = resistancePenetration;
	}
}

registerDeserializer(Boss, (input: string) => Deserialize(JSON.parse(input), Boss));
registerSerializer(Boss, (input: Boss | Boss[]) => Serialize(input, Boss));

export type Bosses = Array<Boss>;
