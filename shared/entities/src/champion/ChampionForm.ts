import { autoserializeAs, autoserialize } from 'cerialize';

import { ChampionSkill } from './ChampionSkill';

export interface IChampionFormOptions {
	active: ChampionSkill;
	grade: number;
	passive?: ChampionSkill | null;
	exclusive?: ChampionSkill | null;
}

export class ChampionForm {
	@autoserializeAs(ChampionSkill) public readonly active!: ChampionSkill;
	@autoserializeAs(ChampionSkill) public readonly passive: ChampionSkill | null | undefined;
	@autoserializeAs(ChampionSkill) public readonly exclusive: ChampionSkill | null | undefined;
	@autoserialize public readonly grade!: number;

	constructor(options: IChampionFormOptions) {
		if (!options) return; // only for tests

		this.active = options.active;
		this.passive = options.passive;
		this.exclusive = options.exclusive;
		this.grade = options.grade;
	}
}
