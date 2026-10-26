import {
	HorizontalAlign, Jimp, JimpInstance, loadFont, measureText, measureTextHeight, rgbaToInt
} from 'jimp';
import { SANS_16_BLACK } from 'jimp/fonts';

import { InteractionRendererInput } from '../../common-types';

import createImage from './createImage';
import localImagePath from './localImagePath';

const PIXEL_SIZE = 2;
const GAP = 5;

const fontCache = loadFont(SANS_16_BLACK);

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

const COLORS = {
	[-1]: rgbaToInt(0, 0, 0, 0),
	0: rgbaToInt(184, 168, 122, 62),
	1: rgbaToInt(184, 168, 122, 190),
	2: rgbaToInt(244, 239, 217, 190),
} as Record<PaletteIndex, number>;

function setVirtualPixel(img: JimpInstance, x: number, y: number, color: number): JimpInstance {
	for (let i = 0; i < PIXEL_SIZE; i++) {
		for (let j = 0; j < PIXEL_SIZE; j++) {
			img.setPixelColor(color, x * PIXEL_SIZE + i, y * PIXEL_SIZE + j);
		}
	}

	return img;
}

async function generateCorner(pos: Corner): Promise<JimpInstance> {
	const corner = await createImage(CORNER_LAYOUT[0].length * PIXEL_SIZE, CORNER_LAYOUT.length * PIXEL_SIZE);

	for (let x = 0; x < CORNER_LAYOUT.length; x++) {
		for (let y = 0; y < CORNER_LAYOUT[x].length; y++) {
			setVirtualPixel(corner, x, y, COLORS[CORNER_LAYOUT[x][y]]);
		}
	}

	corner.rotate({ deg: 90 * pos, mode: false });

	return corner;
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

async function generateLine(length: number, rot: LineRotation): Promise<JimpInstance> {
	const l = length;
	const w = LINE_LAYOUT.length * PIXEL_SIZE;

	const horizontal = rot === LineRotation.TOP || rot === LineRotation.BOTTOM;
	const line = horizontal ? await createImage(l, w) : await createImage(w, l);

	switch (rot) {
		case LineRotation.TOP:
			return line.scan(0, 0, l, w, (x, y) => {
				line.setPixelColor(COLORS[LINE_LAYOUT[Math.floor(y / PIXEL_SIZE)]], x, y);
			});
		case LineRotation.LEFT:
			return line.scan(0, 0, w, l, (x, y) => {
				line.setPixelColor(COLORS[LINE_LAYOUT[Math.floor(x / PIXEL_SIZE)]], x, y);
			});
		case LineRotation.BOTTOM:
			return line.scan(0, 0, l, w, (x, y) => {
				line.setPixelColor(COLORS[LINE_LAYOUT[Math.floor((w - y - 1) / PIXEL_SIZE)]], x, y);
			});
		case LineRotation.RIGHT:
			return line.scan(0, 0, w, l, (x, y) => {
				line.setPixelColor(COLORS[LINE_LAYOUT[Math.floor((w - x - 1) / PIXEL_SIZE)]], x, y);
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

async function generateBubble(text: string): Promise<JimpInstance> {
	const font = await fontCache;

	const arrowWidth = ARROW_LAYOUT[0].length * PIXEL_SIZE;
	const arrowHeight = ARROW_LAYOUT.length * PIXEL_SIZE;

	const cornerWidth = CORNER_LAYOUT[0].length * PIXEL_SIZE;
	const cornerHeight = CORNER_LAYOUT.length * PIXEL_SIZE;

	const w = Math.min(measureText(font, text), MAX_BUBBLE_TEXT_LENGTH * PIXEL_SIZE) + PIXEL_SIZE * 2;

	const h = measureTextHeight(font, text, w) + PIXEL_SIZE * 2;

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
		);

	// Background
	bubble.scan(cornerWidth, cornerHeight, w, h, (x, y) => {
		bubble.setPixelColor(COLORS[2], x, y);
	});

	// Arrow
	bubble.scan(arrowXStart, arrowYStart, arrowWidth, arrowHeight, (x, y) => {
		const dx = x - arrowXStart;
		const dy = y - arrowYStart;

		bubble.setPixelColor(COLORS[ARROW_LAYOUT[Math.floor(dy / PIXEL_SIZE)][Math.floor(dx / PIXEL_SIZE)]], x, y);
	});

	// Text
	bubble.print({
		font,
		x: cornerWidth + PIXEL_SIZE,
		y: cornerHeight + PIXEL_SIZE,
		text: {
			text,
			alignmentX: HorizontalAlign.CENTER,
		},
		maxWidth: w,
		maxHeight: h,
	});

	return bubble;
}

async function generateSpriteWithBubble(
	input: InteractionRendererInput,
	facingRight: boolean
): Promise<JimpInstance> {
	const [heroSprite, bubble] = await Promise.all([
		Jimp.read(localImagePath(`heroes/${input.imageKey}`)),
		generateBubble(input.text)
	]);

	const canvas = await createImage(
		Math.max(heroSprite.width, bubble.width),
		heroSprite.height + bubble.height + 2 * PIXEL_SIZE
	);

	return canvas
		.composite(bubble, (canvas.width - bubble.width) / 2, 0)
		.composite(
			heroSprite.flip({ horizontal: !facingRight, vertical: false }),
			(canvas.width - heroSprite.width) / 2,
			bubble.height + 2 * PIXEL_SIZE
		);
}

export default async function generateInteraction(input: InteractionRendererInput[]): Promise<JimpInstance> {
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

	const width = sprites.reduce((r, v) => r + v.width, (sprites.length - 1) * GAP);
	const height = sprites.reduce((r, v) => Math.max(r, v.height), 0);

	const canvas = await createImage(width, height);

	let x = 0;

	for (const sprite of sprites) {
		canvas.composite(
			sprite,
			x,
			height - sprite.height
		);

		x += sprite.width + GAP;
	}

	return canvas;
}
