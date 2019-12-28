export default (args: readonly string[], remove: any[] = []): string => {
	const toRemove = remove.map(String);

	return args.filter(r => !toRemove.includes(r)).join(' ');
};
