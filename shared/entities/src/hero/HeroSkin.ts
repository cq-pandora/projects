import { autoserialize } from 'cerialize';

import { HeroStats } from './types';

export class HeroSkin {
	@autoserialize public readonly id: number;
	@autoserialize public readonly image: string;
	@autoserialize public readonly cost: number;
	@autoserialize public readonly name: string;
	@autoserialize public readonly stats: Record<HeroStats, number>;

	constructor(id: number, image: string, cost: number, name: string, stats: Record<HeroStats, number>) {
		this.id = id;
		this.image = image;
		this.cost = cost;
		this.name = name;
		this.stats = stats;
	}
}

export type HeroSkins = Array<HeroSkin>;
