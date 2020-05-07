import { autoserialize } from 'cerialize';

import { HeroStats } from './types';

export interface IHeroSkinOptions {
	id: number;
	image: string;
	cost: number;
	name: string;
	stats: Record<HeroStats, number>;
}

export class HeroSkin {
	@autoserialize public readonly id!: number;
	@autoserialize public readonly image!: string;
	@autoserialize public readonly cost!: number;
	@autoserialize public readonly name!: string;
	@autoserialize public readonly stats!: Record<HeroStats, number>;

	constructor(options: IHeroSkinOptions) {
		if (!options) return; // only for tests

		this.id = options.id;
		this.image = options.image;
		this.cost = options.cost;
		this.name = options.name;
		this.stats = options.stats;
	}
}

export type HeroSkins = Array<HeroSkin>;
