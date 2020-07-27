import * as path from 'path';
import glob from 'glob';
import { exec } from 'child_process';
import { sync as mkdirp } from 'mkdirp';
import { Logger } from 'winston';
import { promisify } from 'util';
import { writeFile } from 'fs';
import tmp from 'tmp';

import { paths } from '../config';

const writeFileAsync = promisify(writeFile);

async function tmpFile(): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		tmp.tmpName(((err, name) => (err ? reject(err) : resolve(path.resolve(name)))));
	});
}

async function run(cmdline: string): Promise<string> {
	return new Promise((resolve, reject) => {
		exec(cmdline, (err, out) => {
			if (err) {
				reject(err);
				return;
			}

			resolve(out);
		});
	});
}

type SplitOptions = {
	filesDir: string;
	patterns: string[];
	outputDir: string;
	logger: Logger;
	scale?: number;
};

export default async function splitUnity(options: SplitOptions): Promise<void> {
	const {
		logger, patterns, filesDir, outputDir, scale
	} = options;

	const assetsDir = path.resolve(filesDir);

	const patternsPath = `${assetsDir + path.sep}{${patterns.join(',')}}`;

	logger.verbose(`Started processing ${patternsPath}`);

	const files = patterns.map(pattern => glob.sync(pattern, { cwd: assetsDir })).flat();
	const outputPath = path.resolve(outputDir);

	mkdirp(outputPath);

	const filePaths = files
		.filter(f => !f.endsWith('_cn'))
		.map(f => path.resolve(assetsDir, f));

	const fileList = await tmpFile();

	await writeFileAsync(fileList, filePaths.join('\n'));

	const unityProjectPath = path.resolve(__dirname, '../../bin/CQSpritesDecompiler');

	const commandParts = [
		`"${paths.unity}" -batchmode -projectPath "${unityProjectPath}" -executeMethod EditorAutoplay.AutoPlay`,
		`--output "${outputPath}" --files "${fileList}"`
	];

	if (scale) commandParts.push(`--scale ${scale}`);

	try {
		await run(commandParts.join(' '));

		logger.verbose(`Finished processing ${patternsPath}`);
	} catch (err) {
		logger.error(`Error processing ${patternsPath}`, err);
	}
}
