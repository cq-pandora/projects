import * as path from 'path';

import splitUnity from './split-unity';
import { images, paths } from '../config';
import { makeLogger } from '../logger';

const logger = makeLogger('sprites');

export default async function split(): Promise<void> {
	const assetsDir = path.resolve(paths.gameCachePath, 'files', 'Assets');
	const outputDir = paths.spritesOutputDir;

	for (const [scale, types] of Object.entries(images)) {
		for (const [type, patterns] of Object.entries(types)) {
			await splitUnity({
				filesDir: assetsDir,
				patterns,
				outputDir: path.resolve(outputDir, type),
				logger,
				scale: parseFloat(scale),
			});
		}
	}
}
