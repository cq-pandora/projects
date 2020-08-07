import { InheritanceLevel } from '@cquest/entities';

import range from './range';

const inhLevel = range(1, 35);

export default (args: readonly string[]): InheritanceLevel | undefined => {
	const grade = args.map(p => parseInt(p, 10)).find(i => inhLevel.includes(i));

	if (grade === undefined) return undefined;

	return grade as InheritanceLevel;
};
