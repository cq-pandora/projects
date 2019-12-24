import { autoserializeAs, autoserialize } from 'cerialize';

import ChampionSkill from './ChampionSkill';

export default class ChampionForm {
	@autoserializeAs(ChampionSkill) public readonly active: ChampionSkill;
	@autoserializeAs(ChampionSkill) public readonly passive: ChampionSkill | null | undefined;
	@autoserializeAs(ChampionSkill) public readonly exclusive: ChampionSkill | null | undefined;
	@autoserialize public readonly grade: number;

	constructor(
		active: ChampionSkill, passive: ChampionSkill | null | undefined, exclusive: ChampionSkill | null | undefined,
		grade: number
	) {
		this.active = active;
		this.passive = passive;
		this.exclusive = exclusive;
		this.grade = grade;
	}
}
