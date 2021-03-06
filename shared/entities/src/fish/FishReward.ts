import { autoserialize } from 'cerialize';

export interface IFishReward {
	type: string;
	amount: number;
}

export class FishReward {
	@autoserialize public readonly type!: string;
	@autoserialize public readonly amount!: number;

	constructor(options: IFishReward) {
		if (!options) return; // only for tests

		this.type = options.type;
		this.amount = options.amount;
	}
}

export type FishRewards = Array<FishReward>;
