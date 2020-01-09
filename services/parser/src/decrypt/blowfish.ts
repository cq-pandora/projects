import Blowfish from 'egoroof-blowfish';
import { ungzip } from 'node-gzip';
import { readFile } from 'fs';
import { promisify } from 'util';

import { crypto } from '../config';

const readFileAsync = promisify(readFile);

const bf = new Blowfish(Buffer.from(crypto.key, 'hex'), Blowfish.MODE.CBC);
bf.setIv(Buffer.from(crypto.iv, 'hex'));

function bfDecrypt(content: Buffer): Uint8Array {
	return bf.decode(content, Blowfish.TYPE.UINT8_ARRAY);
}

export async function decrypt(absoluteFilename: string | string[]): Promise<string | string[]> {
	if (Array.isArray(absoluteFilename)) {
		return Promise.all(absoluteFilename.map(decrypt).map(p => p.catch(e => e)));
	}

	const encrypted = await readFileAsync(absoluteFilename);
	const jsonBuffer = await ungzip(bfDecrypt(encrypted));
	return JSON.stringify(JSON.parse(jsonBuffer.toString()), null, 4);
}
