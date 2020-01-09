import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import Jimp from 'jimp';
import tmp from 'tmp';
import { sync as mkdirp } from 'mkdirp';
import { promisify } from 'util';
import { Logger } from 'winston';

import { parseTK2D, ITK2DObject } from '../util';

const readFile = promisify(fs.readFile);

type Images = Record<string, string>;
type SplitResult = {
	images: Images;
	text?: string;
};

function splitImageAndText(files: string[]): SplitResult {
	const images: Images = {};
	let text: string | undefined;

	for (const file of files) {
		if (!file || file.match(/^ *$/) !== null) continue;

		const [filePath, id] = file.split('"');

		if (filePath.endsWith('png')) {
			images[id] = filePath;
			continue;
		}

		text = filePath;
	}

	return {
		images,
		text,
	};
}

function run(inputFilename: string, outputDir: string, executablePath: string): Promise<string[]> {
	return new Promise<string[]>((resolve, reject) => {
		exec(`"${executablePath}" -c -f "${inputFilename}" -e "${outputDir}"`, (err, out): void => {
			if (err) {
				reject(err);
				return;
			}

			resolve(out.replace(/\r/g, '').split('\n'));
		});
	});
}

const parseCommaFloat = (i: string): number => parseFloat(i.replace(',', '.'));

interface ITK2DSpriteData extends ITK2DObject {
	data: {
		name: string;
		boundsData: {
			Array: string;
		};
		uvs: {
			Array: {
				data: {
					x: string;
					y: string;
				};
			}[];
		};
		texelSize: {
			x: number;
			y: number;
		};
		flipped: string;
		material: {
			m_PathID: string;
		};
	};
}

interface ITK2DSpriteCollectionData extends ITK2DObject {
	spriteCollectionName: string;
	spriteDefinitions: {
		Array: ITK2DSpriteData[];
	};
}

async function split(
	outputDir: string, createOwnDirectory: boolean, file: ITK2DSpriteCollectionData, sourceImages: Record<string, Jimp>,
	logger: Logger
): Promise<string[]> {
	let spritesOutputDir = outputDir;

	if (createOwnDirectory) spritesOutputDir = path.join(spritesOutputDir, file.spriteCollectionName);

	mkdirp(spritesOutputDir);

	const images: string[] = [];

	for (const spriteRaw of file.spriteDefinitions.Array) {
		const sprite = spriteRaw.data;
		const image = sourceImages[sprite.material.m_PathID];

		if (!image) {
			logger.warn(`Unable to find ${sprite.material.m_PathID} for sprite ${sprite.name}`);
			continue;
		}

		const { width, height } = image.bitmap;

		const uvs = sprite.uvs.Array.map(uv => ({
			x: parseCommaFloat(uv.data.x),
			y: parseCommaFloat(uv.data.y),
		}));

		if (uvs.length !== 4) {
			logger.warn(`Sprite ${sprite.name} is not square`);
			continue;
		}

		let hx = -1; let hy = -1; let lx = 9999999999; let
			ly = 9999999999;

		for (const uv of uvs) {
			const x = Math.round(uv.x * width);
			const y = Math.round(uv.y * height);

			hx = Math.max(hx, x); lx = Math.min(lx, x);
			hy = Math.max(hy, y); ly = Math.min(ly, y);
		}

		const spriteWidth = hx - lx;
		const spriteHeight = hy - ly;

		let sprImg = await image.clone().crop(
			lx,
			height - hy,
			spriteWidth,
			spriteHeight
		).resize(sprite.texelSize.x * spriteWidth, sprite.texelSize.y * spriteHeight, Jimp.RESIZE_NEAREST_NEIGHBOR);

		if (parseInt(sprite.flipped, 10)) {
			sprImg = sprImg.flip(false, true).rotate(90);
		}

		const fullFileName = path.join(spritesOutputDir, `${sprite.name}.png`);

		sprImg
			.scale(2, Jimp.RESIZE_NEAREST_NEIGHBOR)
			.write(fullFileName);

		logger.warn(`Processed ${sprite.name}`);
		images.push(fullFileName);
	}

	return images;
}

type LoadedFiles = {
	file: ITK2DSpriteCollectionData;
	images: Record<string, Jimp>;
};

async function readFiles({ images, text }: SplitResult): Promise<LoadedFiles> {
	const imgs: Record<string, Jimp> = {};

	if (!text) throw new Error('Sprite data not found');

	for (const [id, filepath] of Object.entries(images)) {
		imgs[id] = (await Jimp.read(filepath)).flip(false, true);
	}

	return {
		file: parseTK2D(await readFile(text, { encoding: 'utf8' })) as ITK2DSpriteCollectionData,
		images: imgs,
	};
}

type SplitOptions = {
	filename: string;
	outputDir: string;
	executablePath: string;
	createOwnDirectory: boolean;
	logger: Logger;
};

export default async function (optionsRaw: Partial<SplitOptions>): Promise<string[]> {
	const options = {
		createOwnDirectory: true,
		executablePath: path.resolve(__dirname, '..', '..', 'bin', 'AssetStudio', 'AssetStudio.exe'),
		...optionsRaw,
	} as SplitOptions;

	const tmpAssetsOutputPath = tmp.dirSync({ unsafeCleanup: true });
	const assetsOutputPath = tmpAssetsOutputPath.name;

	const assetStudioOutput = await run(options.filename, assetsOutputPath, options.executablePath);
	const filesInfo = await splitImageAndText(assetStudioOutput);
	const { file, images } = await readFiles(filesInfo);

	return split(options.outputDir, options.createOwnDirectory, file, images, options.logger);
}
