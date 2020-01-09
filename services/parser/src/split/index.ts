import * as path from 'path';
import glob from 'glob';

import splitPortraits from './split-complicated';
import splitSprites from './split-simple';
import { images, paths } from '../config';
import { makeLogger } from '../logger';

const logger = makeLogger('sprites');

export default async function split(): Promise<void> {
	const requiredCollections = images.collections;
	const assetsDir = path.resolve(paths.gameCachePath, 'files', 'Assets');
	const outputDir = paths.spritesOutputDir;

	for (const spritesType of Object.keys(requiredCollections)) {
		for (const pattern of requiredCollections[spritesType]) {
			const files = glob.sync(pattern, { cwd: assetsDir });
			const outputPath = path.resolve(outputDir, spritesType);

			for (const file of files) {
				if (file.endsWith('_cn')) continue;

				const fullPath = path.resolve(assetsDir, file);

				logger.verbose(`Started processing ${fullPath}`);

				try {
					await splitSprites({
						filename: fullPath,
						outputDir: outputPath,
						createOwnDirectory: false,
						logger,
					});

					logger.verbose(`Successfully processed ${fullPath}`);
				} catch (e) {
					logger.error(`Unable to parse ${fullPath}`, e);
				}
			}
		}
	}

	for (const spritesType of Object.keys(images.collectionsSplit)) {
		for (const pattern of images.collectionsSplit[spritesType]) {
			await splitPortraits({
				filesDir: assetsDir,
				pattern,
				outputDir: path.resolve(outputDir, spritesType),
				logger,
			});
		}
	}
}
