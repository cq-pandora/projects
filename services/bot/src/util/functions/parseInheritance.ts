import { InheritanceLevel } from '@pandora/entities';

import range from './range';

export default (args: readonly string[]): InheritanceLevel | undefined => {
	const grade = args.find(i => range(1, 30).includes(parseInt(i, 10)));

	if (grade === undefined) return undefined;

	// @ts-ignore
	return parseInt(grade, 10) || undefined;
};
