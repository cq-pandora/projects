import {
	autoserializeAs, autoserialize, Deserialize, Serialize
} from 'cerialize';

import { registerDeserializer } from '../Deserializer';
import { HeroClass, HeroType, HeroGender } from './types';

import { IStatsHolder } from '../interfaces';

import { HeroSBW } from './HeroSBW';
import { HeroSkin } from './HeroSkin';
import { HeroBerriesStats } from './HeroBerriesStats';
import { registerSerializer } from '../Serializer';

export interface IHeroFormOptions {
	id: string;
	name: string;
	image: string;
	star: number;
	accuracy: number;
	armor: number;
	armorPenetration: number;
	recruitDialog: string;
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
	lore: string;
	blockImage: string;
	skillLvl: number;
	passiveName: string;
	blockName: string;
	blockDescription: string;
	passiveDescription: string;
	maxBerries: HeroBerriesStats;
}

export class HeroForm implements IStatsHolder {
	readonly all: number = -1;
	@autoserialize public readonly id!: string;
	@autoserialize public readonly name!: string;
	@autoserializeAs('recruit_dialog') public readonly recruitDialog!: string;
	@autoserialize public readonly image!: string;
	@autoserialize public readonly star!: number;
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
	@autoserialize public readonly lore!: string;
	@autoserializeAs('block_image') public readonly blockImage!: string;
	@autoserializeAs('skill_lvl') public readonly skillLvl!: number;
	@autoserializeAs('passive_name') public readonly passiveName!: string;
	@autoserializeAs('block_name') public readonly blockName!: string;
	@autoserializeAs('block_description') public readonly blockDescription!: string;
	@autoserializeAs('passive_description') public readonly passiveDescription!: string;
	@autoserializeAs(HeroBerriesStats, 'max_berries') public readonly maxBerries!: HeroBerriesStats;

	public hero!: Hero;

	constructor(options: IHeroFormOptions) {
		if (!options) return; // only for tests

		this.id = options.id;
		this.name = options.name;
		this.image = options.image;
		this.star = options.star;
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
		this.lore = options.lore;
		this.blockImage = options.blockImage;
		this.skillLvl = options.skillLvl;
		this.passiveName = options.passiveName;
		this.blockName = options.blockName;
		this.blockDescription = options.blockDescription;
		this.passiveDescription = options.passiveDescription;
		this.maxBerries = options.maxBerries;
		this.recruitDialog = options.recruitDialog;
	}
}

export interface IHeroOptions {
	id: string;
	readableId: string;
	clazz: HeroClass;
	type: HeroType;
	gender: HeroGender;
	domain: string;
	forms: Array<HeroForm>;
	sbws: Array<HeroSBW>;
	skins: Array<HeroSkin>;
}

export class Hero {
	@autoserialize public readonly id!: string;
	@autoserializeAs('readable_id') public readonly readableId!: string;
	@autoserializeAs('class') public readonly clazz!: HeroClass;
	@autoserialize public readonly type!: HeroType;
	@autoserialize public readonly gender!: HeroGender;
	@autoserialize public readonly domain!: string;
	@autoserializeAs(HeroForm) public readonly forms!: Array<HeroForm>;
	@autoserializeAs(HeroSBW) public readonly sbws!: Array<HeroSBW>;
	@autoserializeAs(HeroSkin) public readonly skins!: Array<HeroSkin>;

	public static OnDeserialized(instance: Hero): void {
		for (const form of instance.forms) {
			form.hero = instance;
		}
	}

	constructor(options: IHeroOptions) {
		if (!options) return; // only for tests

		this.id = options.id;
		this.readableId = options.readableId;
		this.clazz = options.clazz;
		this.type = options.type;
		this.gender = options.gender;
		this.domain = options.domain;
		this.forms = options.forms;
		this.sbws = options.sbws;
		this.skins = options.skins;
	}
}

registerDeserializer(Hero, (input: string) => Deserialize(JSON.parse(input), Hero));
registerSerializer(Hero, (input: Hero | Hero[]) => Serialize(input, Hero));

export type Heroes = Array<Hero>;
