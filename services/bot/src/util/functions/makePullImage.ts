import Jimp from 'jimp';
import { HeroForm } from '@pandora/entities';

import chunk from './chunk';
import createImage from './createImage';
import localImagePath from './localImagePath';

const WIDTH_GAP = 10;
const HEIGHT_GAP = 5;

const cacheStarImage = Jimp.read(localImagePath('common/ui_icon_star_01'));

async function getStarsImage(count: number): Promise<Jimp> {
	const starImage = await cacheStarImage;

	const container = await createImage(starImage.bitmap.width * count, starImage.bitmap.height);

	let x = 0;
	for (let i = 0; i < count; i++) {
		container.composite(starImage, x, 0);

		x += starImage.bitmap.width;
	}

	return container;
}

async function renderForm(form: HeroForm): Promise<Jimp> {
	const [sprite, stars] = await Promise.all([
		Jimp.read(localImagePath(`heroes/${form.image}`)),
		getStarsImage(form.star)
	]);

	const canvas = await createImage(
		Math.max(sprite.bitmap.width, stars.bitmap.width),
		sprite.bitmap.height + stars.bitmap.height + 2
	);

	canvas
		.composite(sprite, (canvas.bitmap.width - sprite.bitmap.width) / 2, 0)
		.composite(stars, (canvas.bitmap.width - stars.bitmap.width) / 2, sprite.bitmap.height + 2);

	return canvas;
}

async function createRow(sprites: Jimp[], targetSpriteWidth: number): Promise<Jimp> {
	const height = Math.max(...(sprites.map(s => s.bitmap.height)));

	const container = await createImage(
		WIDTH_GAP * (sprites.length - 1) + targetSpriteWidth * sprites.length,
		height + 10
	);

	let x = 0;

	for (const sprite of sprites) {
		container.composite(
			sprite,
			x + (targetSpriteWidth - sprite.bitmap.width) / 2,
			height - sprite.bitmap.height + 5
		);

		x = x + WIDTH_GAP + targetSpriteWidth;
	}

	return container;
}

export default async (forms: HeroForm[]): Promise<Jimp> => {
	const sprites = await Promise.all(forms.map(renderForm));
	const per5Sprites = chunk(sprites, 5);

	const spriteWidth = per5Sprites.reduce(
		(r, chuk) => Math.max(r, chuk.reduce((chunkWidth, sprite) => Math.max(chunkWidth, sprite.bitmap.width), 0)),
		0
	);

	let totalHeight = 0;
	const rows = await Promise.all(per5Sprites.map(async (sprite) => {
		const row = await createRow(sprite, spriteWidth);

		totalHeight += row.bitmap.height;

		return row;
	}));

	const canvas = await createImage(
		spriteWidth * 5 + WIDTH_GAP * 4,
		totalHeight + HEIGHT_GAP * (per5Sprites.length - 1)
	);

	let y = 0;
	for (const sprite of rows) {
		canvas.composite(sprite, 0, y);

		y = y + HEIGHT_GAP + sprite.bitmap.height;
	}

	return canvas;
};
