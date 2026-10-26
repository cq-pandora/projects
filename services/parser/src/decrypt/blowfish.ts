import { Blowfish } from 'egoroof-blowfish';
import { readFile } from 'node:fs/promises';
import { gunzip } from 'node:zlib';
import { promisify } from 'node:util';

import { crypto } from '../config';

const gunzipAsync = promisify(gunzip);

const bf = new Blowfish(Buffer.from(crypto.blowfish.key, 'hex'), Blowfish.MODE.CBC);
bf.setIv(Buffer.from(crypto.blowfish.iv, 'hex'));

function bfDecrypt(content: Buffer): Uint8Array {
	return bf.decode(content, Blowfish.TYPE.UINT8_ARRAY);
}

export function decrypt(absoluteFilename: string[]): Promise<string[]>;
export function decrypt(absoluteFilename: string): Promise<string>;
export async function decrypt(absoluteFilename: string | string[]): Promise<string | string[]> {
	if (Array.isArray(absoluteFilename)) {
		return Promise.all(absoluteFilename.map(decrypt).map(p => p.catch(e => e)));
	}

	const encrypted = await readFile(absoluteFilename);
	const jsonBuffer = await gunzipAsync(bfDecrypt(encrypted));
	return JSON.stringify(JSON.parse(jsonBuffer.toString()), null, 4);
}
