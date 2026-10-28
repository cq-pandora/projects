import { autoserialize } from 'cerialize';

export interface IFishReward {
	type: string;
	amount: number;
	name: string;
}

export class FishReward {
	@autoserialize public readonly type!: string;
	@autoserialize public readonly amount!: number;
	/** Translation key of the rewarded item */
	@autoserialize public readonly name!: string;

	constructor(options: IFishReward) {
		if (!options) return; // only for tests

		this.type = options.type;
		this.amount = options.amount;
		this.name = options.name;
	}
}

export type FishRewards = FishReward[];
