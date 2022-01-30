import { readFileSync } from 'fs';
import { join as pathJoin } from 'path';

const defaultPath = pathJoin(__dirname, '../../../');

export default function loadRootConfig(path: string, configPath: string = defaultPath): string {
	try {
		return readFileSync(pathJoin(configPath, path), { encoding: 'utf-8' });
	} catch (e: any) {
		return readFileSync(pathJoin(defaultPath, path), { encoding: 'utf-8' });
	}
}
