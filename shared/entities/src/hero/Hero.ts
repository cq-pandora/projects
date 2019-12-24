import { autoserializeAs, autoserialize } from 'cerialize';

import { HeroClass, HeroType, HeroGender } from './types';

import { HeroForm } from './HeroForm';
import { HeroSBW } from './HeroSBW';
import { HeroSkin } from './HeroSkin';

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

export type Heroes = Array<Hero>;
