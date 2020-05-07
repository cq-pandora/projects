import { autoserializeAs, autoserialize } from 'cerialize';

import { WeaponType } from './types';

export interface IHeroSBWOptions {
	id: string;
	name: string;
	image: string;
	ability: string;
	star: number;
	atkPower: number;
	atkSpeed: number;
	clazz: WeaponType;
}

export class HeroSBW {
	@autoserialize public readonly id: string;
	@autoserialize public readonly name: string;
	@autoserialize public readonly image: string;
	@autoserialize public readonly ability: string;
	@autoserialize public readonly star: number;
	@autoserializeAs('atk_power') public readonly atkPower: number;
	@autoserializeAs('atk_speed') public readonly atkSpeed: number;
	@autoserializeAs('class') public readonly clazz: WeaponType;

	constructor(options: IHeroSBWOptions) {
		this.id = options.id;
		this.name = options.name;
		this.image = options.image;
		this.ability = options.ability;
		this.star = options.star;
		this.atkPower = options.atkPower;
		this.atkSpeed = options.atkSpeed;
		this.clazz = options.clazz;
	}
}

export type HeroSBWs = Array<HeroSBW>;
