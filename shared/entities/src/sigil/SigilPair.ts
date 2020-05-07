import { autoserialize } from 'cerialize';

export interface ISigilPairOptions {
	name: string;
	effect: string;
	pair: string;
}

export class SigilPair {
	@autoserialize public readonly name: string;
	@autoserialize public readonly effect: string;
	@autoserialize public readonly pair: string;

	constructor(options: ISigilPairOptions) {
		this.name = options.name;
		this.effect = options.effect;
		this.pair = options.pair;
	}
}
