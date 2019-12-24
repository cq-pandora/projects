import { autoserialize } from 'cerialize';

export default class SigilPair {
	@autoserialize public readonly name: string;
	@autoserialize public readonly effect: string;
	@autoserialize public readonly pair: string;

	constructor(name: string, effect: string, pair: string) {
		this.name = name;
		this.effect = effect;
		this.pair = pair;
	}
}
