import { readdir, writeFile } from 'fs';
import { promisify } from 'util';
import { resolve as pathResolve, basename, extname } from 'path';

import { decrypt as decryptBlowfish } from './blowfish';
import { paths } from '../config';
import { makeLogger } from '../logger';

const readDirAsync = promisify(readdir);
const writeFileAsync = promisify(writeFile);

const logger = makeLogger('decrypt');

export default async function decrypt(): Promise<void> {
	const dataDir = pathResolve(paths.gameCachePath, 'files', 'Datas');
	const files = await readDirAsync(dataDir);

	for (const file of files) {
		const decrypted = await decryptBlowfish(pathResolve(dataDir, file));

		const outputFileName = basename(file, extname(file));
		const outputFilePath = pathResolve(paths.decryptOutputDir, `${outputFileName}.json`);

		await writeFileAsync(outputFilePath, decrypted);

		logger.verbose(`Decrypted ${file} to ${outputFilePath}`);
	}
}
