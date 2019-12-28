import { autoserializeAs, autoserialize, Deserialize } from 'cerialize';

import { registerDeserializer } from '../Deserializer';
import { HeroClass, HeroType, HeroGender } from './types';

import { IStatsHolder } from '../interfaces';

import { HeroSBW } from './HeroSBW';
import { HeroSkin } from './HeroSkin';
import HeroBerriesStats from './HeroBerriesStats';

export class HeroForm implements IStatsHolder {
	readonly all: number = -1;
	@autoserialize public readonly id: string;
	@autoserialize public readonly name: string;
	@autoserialize public readonly image: string;
	@autoserialize public readonly star: number;
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
	@autoserialize public readonly lore: string;
	@autoserializeAs('block_image') public readonly blockImage: string;
	@autoserializeAs('skill_lvl') public readonly skillLvl: number;
	@autoserializeAs('passive_name') public readonly passiveName: string;
	@autoserializeAs('block_name') public readonly blockName: string;
	@autoserializeAs('block_description') public readonly blockDescription: string;
	@autoserializeAs('passive_description') public readonly passiveDescription: string;
	@autoserializeAs(HeroBerriesStats, 'max_berries') public readonly maxBerries: HeroBerriesStats;
	// @ts-ignore
	public hero: Hero = null;

	constructor(
		id: string, name: string, image: string, star: number, accuracy: number, armor: number,
		armorPenetration: number, atkPower: number, critChance: number, critChanceReduction: number, critDmg: number,
		dmgReduction: number, evasion: number, hp: number, lifesteal: number, resistance: number,
		resistancePenetration: number, lore: string, blockImage: string, skillLvl: number, passiveName: string,
		blockName: string, blockDescription: string, passiveDescription: string, maxBerries: HeroBerriesStats
	) {
		this.id = id;
		this.name = name;
		this.image = image;
		this.star = star;
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
		this.lore = lore;
		this.blockImage = blockImage;
		this.skillLvl = skillLvl;
		this.passiveName = passiveName;
		this.blockName = blockName;
		this.blockDescription = blockDescription;
		this.passiveDescription = passiveDescription;
		this.maxBerries = maxBerries;
	}
}

export class Hero {
	@autoserialize public readonly id: string;
	@autoserializeAs('readable_id') public readonly readableId: string;
	@autoserializeAs('class') public readonly clazz: HeroClass;
	@autoserialize public readonly type: HeroType;
	@autoserialize public readonly gender: HeroGender;
	@autoserialize public readonly domain: string;
	@autoserializeAs(HeroForm) public readonly forms: Array<HeroForm>;
	@autoserializeAs(HeroSBW) public readonly sbws: Array<HeroSBW>;
	@autoserializeAs(HeroSkin) public readonly skins: Array<HeroSkin>;

	public static OnDeserialized(instance: Hero): void {
		for (const form of instance.forms) {
			form.hero = instance;
		}
	}

	constructor(
		id: string, readableId: string, clazz: HeroClass, type: HeroType, gender: HeroGender, domain: string,
		forms: Array<HeroForm>, sbws: Array<HeroSBW>, skins: Array<HeroSkin>
	) {
		this.id = id;
		this.readableId = readableId;
		this.clazz = clazz;
		this.type = type;
		this.gender = gender;
		this.domain = domain;
		this.forms = forms;
		this.sbws = sbws;
		this.skins = skins;
	}
}

registerDeserializer(Hero, (input: string) => Deserialize(JSON.parse(input), Hero));

export type Heroes = Array<Hero>;
