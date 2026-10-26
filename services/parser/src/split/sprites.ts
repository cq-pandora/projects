import { spawn } from 'node:child_process';
import { globSync, mkdirSync } from 'node:fs';
import * as path from 'node:path';
import { createInterface } from 'node:readline';
import { Logger } from 'winston';

import { cryptoPath } from '../config';

// uv project with the UnityPy based sprite extractor (services/parser/sprites)
const spritesProject = path.resolve(__dirname, '../../sprites');

type ExtractOptions = {
	filesDir: string;
	patterns: string[];
	outputDir: string;
	logger: Logger;
	scale: number;
};

async function runSpritesTool(args: string[], logger: Logger): Promise<number> {
	const child = spawn('uv', ['run', '--quiet', '--project', spritesProject, 'cq-sprites', ...args], {
		stdio: ['ignore', 'pipe', 'pipe'],
	});

	createInterface({ input: child.stderr }).on('line', line => logger.verbose(line));
	createInterface({ input: child.stdout }).on('line', line => logger.warn(line));

	return new Promise((resolve, reject) => {
		child.on('error', reject);
		child.on('close', code => resolve(code ?? 1));
	});
}

export default async function extractSprites(options: ExtractOptions): Promise<void> {
	const {
		logger, patterns, filesDir, outputDir, scale
	} = options;

	const description = `${path.resolve(filesDir)}${path.sep}{${patterns.join(',')}}`;

	const files = [...new Set(patterns.flatMap(pattern => globSync(pattern, { cwd: filesDir })))]
		.filter(file => !file.endsWith('_cn'))
		.map(file => path.resolve(filesDir, file));

	if (!files.length) {
		logger.warn(`No bundles match ${description}`);
		return;
	}

	mkdirSync(outputDir, { recursive: true });

	logger.verbose(`Started processing ${description}`);

	try {
		const code = await runSpritesTool(
			['--output', outputDir, '--scale', String(scale), '--crypto', cryptoPath, ...files],
			logger
		);

		if (code === 0) {
			logger.verbose(`Finished processing ${description}`);
		} else {
			logger.error(`Processed ${description} with errors (exit code ${code})`);
		}
	} catch (err) {
		logger.error(`Error processing ${description}`, err);
	}
}
