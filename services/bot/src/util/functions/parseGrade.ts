import range from './range';

export default (args: readonly string[]): number | undefined => {
	const grade = args.find(i => range(1, 6).includes(parseInt(i, 10)));

	if (grade === undefined) return undefined;

	return parseInt(grade, 10) || undefined;
};
