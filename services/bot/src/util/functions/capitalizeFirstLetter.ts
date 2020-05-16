export default (str: string | null | undefined): string => (
	str
		? str.charAt(0).toUpperCase() + str.substring(1)
		: ''
);
