import * as path from 'path';
import glob from 'glob';
import { exec } from 'child_process';
import { sync as mkdirp } from 'mkdirp';
import { Logger } from 'winston';

import { paths } from '../config';

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
	pattern: string;
	outputDir: string;
	logger: Logger;
};

export default async function (options: SplitOptions): Promise<void> {
	const {
		logger, pattern, filesDir, outputDir
	} = options;

	const assetsDir = path.resolve(filesDir);

	logger.verbose(`Started processing ${assetsDir + path.sep + pattern}`);

	const files = glob.sync(pattern, { cwd: assetsDir });
	const outputPath = path.resolve(outputDir);

	mkdirp(outputPath);

	const filePaths = files
		.filter(f => !f.endsWith('_cn'))
		.map(f => path.resolve(assetsDir, f));

	const prefix = `"${paths.unity}" -batchmode -projectPath "${paths.unitySpriteSplitter}" -executeMethod EditorAutoplay.AutoPlay --scriptPaths ${outputPath}`;
	let argPaths = '';

	while (filePaths.length) {
		const entry = filePaths.pop();

		if (`${prefix}${argPaths} "${entry}"`.length < 4000) {
			argPaths += ` "${entry}"`;
		} else {
			try {
				await run(`${prefix}${argPaths}`);
			} catch (e) {
				logger.error(`Unable to parse ${argPaths}`, e);
			}
			argPaths = ` "${entry}"`;
		}
	}

	if (argPaths) {
		await run(`${prefix}${argPaths}`);
	}

	logger.verbose(`Finished processing ${assetsDir + path.sep + pattern}`);
}
