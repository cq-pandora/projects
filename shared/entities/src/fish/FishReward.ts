import { autoserialize } from 'cerialize';

export class FishReward {
	@autoserialize public readonly type: string;
	@autoserialize public readonly amount: number;

	constructor(type: string, amount: number) {
		this.type = type;
		this.amount = amount;
	}
}

export type FishRewards = Array<FishReward>;
