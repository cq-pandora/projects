export default function random(minR: number, maxR: number): number {
	const min = Math.ceil(minR);
	const max = Math.floor(maxR);

	return Math.floor(Math.random() * (max - min + 1)) + min;
}
