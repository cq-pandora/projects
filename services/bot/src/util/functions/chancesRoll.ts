import random from './random';
import { RollChances } from '../../common-types';

export default function chancesRoll(chances: RollChances): string {
	let sum = 0;

	for (const weight of Object.values(chances)) {
		sum += weight;
	}

	const roll = random(0, sum - 1);

	let shift = 0;

	for (const [form, weight] of Object.entries(chances)) {
		if (shift <= roll && roll < shift + weight) {
			return form;
		}

		shift += chances[form];
	}

	return '';
}
