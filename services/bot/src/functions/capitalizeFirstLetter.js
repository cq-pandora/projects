module.exports = str => (
	str
		? str.charAt(0).toUpperCase() + str.substring(1)
		: str
);
