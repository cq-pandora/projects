import { join as pathJoin } from 'path';
import { readFileSync } from 'fs';

import config from '../config';

export function loadInfo(...segments: string[]): string {
	let path: string;

	if (segments.length > 1) {
		path = pathJoin(...segments.slice(0, -1), `${segments[segments.length - 1]}.json`);
	} else {
		path = `${segments[0]}.json`;
	}

	return readFileSync(pathJoin(config.parsedData, path), { encoding: 'utf-8' });
}
