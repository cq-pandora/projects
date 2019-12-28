export default (str: string | null | undefined): string | null | undefined => (
	str
		? str.charAt(0).toUpperCase() + str.substring(1)
		: str
);
