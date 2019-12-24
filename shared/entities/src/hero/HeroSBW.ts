import { autoserializeAs, autoserialize } from 'cerialize';

import { WeaponType } from './types';

export class HeroSBW {
	@autoserialize public readonly id: string;
	@autoserialize public readonly name: string;
	@autoserialize public readonly image: string;
	@autoserialize public readonly ability: string;
	@autoserialize public readonly star: number;
	@autoserializeAs('atk_power') public readonly atkPower: number;
	@autoserializeAs('atk_speed') public readonly atkSpeed: number;
	@autoserializeAs('class') public readonly clazz: WeaponType;

	constructor(
		id: string, name: string, image: string, ability: string, star: number, atkPower: number, atkSpeed: number,
		clazz: WeaponType
	) {
		this.id = id;
		this.name = name;
		this.image = image;
		this.ability = ability;
		this.star = star;
		this.atkPower = atkPower;
		this.atkSpeed = atkSpeed;
		this.clazz = clazz;
	}
}

export type HeroSBWs = Array<HeroSBW>;
