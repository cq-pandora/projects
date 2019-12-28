import { readFileSync } from 'fs';
import { join as pathJoin } from 'path';

export default function loadRootConfig(path: string): string {
	return readFileSync(pathJoin(__dirname, '../../../', path), { encoding: 'utf-8' });
}
