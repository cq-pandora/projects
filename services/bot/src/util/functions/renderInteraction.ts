import Jimp from 'jimp';

import { InteractionRendererInput } from '../../common-types';

import createImage from './createImage';
import localImagePath from './localImagePath';

const PIXEL_SIZE = 2;
const GAP = 5;

const fontCache = Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);

const MAX_BUBBLE_TEXT_LENGTH = 46;

enum Corner {
	LEFT_TOP,
	LEFT_BOTTOM,
	RIGHT_BOTTOM,
	RIGHT_TOP,
}

type PaletteIndex = -1 | 0 | 1 | 2;

const CORNER_LAYOUT = [
	[-1, -1, 0],
	[-1, 0, 1],
	[0, 1, 2],
] as PaletteIndex[][];

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

const COLORS = {
	[-1]: Jimp.rgbaToInt(0, 0, 0, 0, noop),
	0: Jimp.rgbaToInt(184, 168, 122, 62, noop),
	1: Jimp.rgbaToInt(184, 168, 122, 190, noop),
	2: Jimp.rgbaToInt(244, 239, 217, 190, noop),
} as Record<PaletteIndex, number>;

function setVirtualPixel(img: Jimp, x: number, y: number, color: number): Jimp {
	for (let i = 0; i < PIXEL_SIZE; i++) {
		for (let j = 0; j < PIXEL_SIZE; j++) {
			img.setPixelColor(color, x * PIXEL_SIZE + i, y * PIXEL_SIZE + j);
		}
	}

	return img;
}

async function generateCorner(pos: Corner): Promise<Jimp> {
	const corner = await createImage(CORNER_LAYOUT[0].length * PIXEL_SIZE, CORNER_LAYOUT.length * PIXEL_SIZE);

	for (let x = 0; x < CORNER_LAYOUT.length; x++) {
		for (let y = 0; y < CORNER_LAYOUT[x].length; y++) {
			setVirtualPixel(corner, x, y, COLORS[CORNER_LAYOUT[x][y]]);
		}
	}

	return corner.rotate(90 * pos, false);
}

const CORNERS = {
	[Corner.LEFT_TOP]: generateCorner(Corner.LEFT_TOP),
	[Corner.LEFT_BOTTOM]: generateCorner(Corner.LEFT_BOTTOM),
	[Corner.RIGHT_BOTTOM]: generateCorner(Corner.RIGHT_BOTTOM),
	[Corner.RIGHT_TOP]: generateCorner(Corner.RIGHT_TOP),
};

enum LineRotation {
	TOP,
	LEFT,
	BOTTOM,
	RIGHT,
}

const LINE_LAYOUT = [1, 2, 2] as PaletteIndex[];

async function generateLine(length: number, rot: LineRotation): Promise<Jimp> {
	const l = length;
	const w = LINE_LAYOUT.length * PIXEL_SIZE;

	switch (rot) {
		case LineRotation.TOP:
			return (await createImage(l, w))
				.scan(0, 0, l, w, function f(x, y) {
					this.setPixelColor(COLORS[LINE_LAYOUT[Math.floor(y / PIXEL_SIZE)]], x, y);
				});
		case LineRotation.LEFT:
			return (await createImage(w, l))
				.scan(0, 0, w, l, function f(x, y) {
					this.setPixelColor(COLORS[LINE_LAYOUT[Math.floor(x / PIXEL_SIZE)]], x, y);
				});
		case LineRotation.BOTTOM:
			return (await createImage(l, w))
				.scan(0, 0, l, w, function f(x, y) {
					this.setPixelColor(COLORS[LINE_LAYOUT[Math.floor((w - y - 1) / PIXEL_SIZE)]], x, y);
				});
		case LineRotation.RIGHT:
			return (await createImage(w, l))
				.scan(0, 0, w, l, function f(x, y) {
					this.setPixelColor(COLORS[LINE_LAYOUT[Math.floor((w - x - 1) / PIXEL_SIZE)]], x, y);
				});
		default:
			throw new Error(`Bad rotation mode: ${rot}`);
	}
}

const ARROW_LAYOUT = [
	[2, 2, 2],
	[1, 2, 1],
	[0, 1, 0],
	[-1, 0, -1],
] as PaletteIndex[][];

async function generateBubble(text: string): Promise<Jimp> {
	const font = await fontCache;

	const arrowWidth = ARROW_LAYOUT[0].length * PIXEL_SIZE;
	const arrowHeight = ARROW_LAYOUT.length * PIXEL_SIZE;

	const cornerWidth = CORNER_LAYOUT[0].length * PIXEL_SIZE;
	const cornerHeight = CORNER_LAYOUT.length * PIXEL_SIZE;

	const w = Math.min(Jimp.measureText(font, text), MAX_BUBBLE_TEXT_LENGTH * PIXEL_SIZE) + PIXEL_SIZE * 2;

	const h = Jimp.measureTextHeight(font, text, w) + PIXEL_SIZE * 2;

	const bw = w + cornerWidth * 2;
	const bh = h + cornerHeight * 2;

	const arrowXStart = Math.floor((bw - arrowWidth) / 2);
	const arrowYStart = bh - (ARROW_LAYOUT.length - 2) * PIXEL_SIZE;

	const bubble = await createImage(
		bw,
		bh + (ARROW_LAYOUT.length - 2) * PIXEL_SIZE
	);

	const topLine = await generateLine(w, LineRotation.TOP);
	const bottomLine = await generateLine(w, LineRotation.BOTTOM);
	const leftLine = await generateLine(h, LineRotation.LEFT);
	const rightLine = await generateLine(h, LineRotation.RIGHT);

	bubble
		// Borders
		.composite(topLine, cornerWidth - 1, 0)
		.composite(leftLine, 0, cornerHeight - 1)
		.composite(rightLine, bw - cornerWidth - 1, cornerHeight - 1)
		.composite(bottomLine, cornerWidth - 1, bh - cornerHeight - 1)

		// Corners
		.composite(await CORNERS[Corner.LEFT_TOP], 0, 0)
		.composite(
			await CORNERS[Corner.RIGHT_TOP],
			bw - cornerWidth - 1,
			0
		)
		.composite(
			await CORNERS[Corner.RIGHT_BOTTOM],
			bw - cornerWidth - 1,
			bh - cornerHeight - 1,
		)
		.composite(
			await CORNERS[Corner.LEFT_BOTTOM],
			0,
			bh - cornerHeight - 1,
		)

		// Background
		.scan(cornerWidth, cornerHeight, w, h, (x, y) => bubble.setPixelColor(COLORS[2], x, y))

		// Arrow
		.scan(arrowXStart, arrowYStart, arrowWidth, arrowHeight, function f(x, y) {
			const dx = x - arrowXStart;
			const dy = y - arrowYStart;

			this.setPixelColor(COLORS[ARROW_LAYOUT[Math.floor(dy / PIXEL_SIZE)][Math.floor(dx / PIXEL_SIZE)]], x, y);
		})

		// Text
		.print(font, cornerWidth + PIXEL_SIZE, cornerHeight + PIXEL_SIZE, {
			text,
			alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
		}, w, h);

	return bubble;
}

async function generateSpriteWithBubble(
	input: InteractionRendererInput,
	facingRight: boolean
): Promise<Jimp> {
	const [heroSprite, bubble] = await Promise.all([
		Jimp.read(localImagePath(`heroes/${input.imageKey}`)),
		generateBubble(input.text)
	]);

	const canvas = await createImage(
		Math.max(heroSprite.getWidth(), bubble.getWidth()),
		heroSprite.getHeight() + bubble.getHeight() + 2 * PIXEL_SIZE
	);

	return canvas
		.composite(bubble, (canvas.getWidth() - bubble.getWidth()) / 2, 0)
		.composite(
			heroSprite.flip(!facingRight, false),
			(canvas.getWidth() - heroSprite.getWidth()) / 2,
			bubble.getHeight() + 2 * PIXEL_SIZE
		);
}

export default async function generateInteraction(input: InteractionRendererInput[]): Promise<Jimp> {
	const sprites = await Promise.all(input.map((v, idx, arr) => {
		let facingRight: boolean;

		switch (idx) {
			case 0:
				facingRight = true;
				break;
			case arr.length - 1:
				facingRight = false;
				break;
			default:
				facingRight = Boolean(Math.round(Math.random()));
		}

		return generateSpriteWithBubble(v, facingRight);
	}));

	const width = sprites.reduce((r, v) => r + v.getWidth(), (sprites.length - 1) * GAP);
	const height = sprites.reduce((r, v) => Math.max(r, v.getHeight()), 0);

	const canvas = await createImage(width, height);

	let x = 0;

	for (const sprite of sprites) {
		canvas.composite(
			sprite,
			x,
			height - sprite.getHeight()
		);

		x += sprite.getWidth() + GAP;
	}

	return canvas;
}
