import { RollGrade } from '../../common-types';

const defaultChances: RollGrade = {
	3: 0.81,
	4: 0.149,
	5: 0.035,
	6: 0.006,
};

export default function pickGrade(probabilities: RollGrade = defaultChances, def = 3): number {
	const roll = Math.random();

	let shift = 0;

	for (const [grade, probability] of Object.entries(probabilities)) {
		if (shift <= roll && roll < shift + probability) {
			return parseInt(grade, 10);
		}

		shift += probability;
	}

	return def;
}
