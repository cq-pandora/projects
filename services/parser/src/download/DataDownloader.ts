import axios from 'axios';
import { crc32 } from 'crc';

import { promises as fsPromises } from 'fs';
import { resolve as pathResolve } from 'path';

import AbstractDownloader from './AbstractDownloader';
import { paths } from '../config';

const { readFile } = fsPromises;

export default class DataDownloader extends AbstractDownloader {
	constructor() {
		super({
			loggerName: 'download.data',
			baseUrl: 'http://cru.gslb.toastoven.net/Asset/Real/DataSheet/',
		});
	}

	async calculateHash(filepath: string): Promise<string> {
		const contents = await readFile(filepath, null);

		return crc32(contents).toString(16).toUpperCase().padStart(8, '0');
	}

	getDownloadFileName(filename: string): string {
		return `${filename}.data`;
	}

	getFilePath(filename: string): string {
		return pathResolve(paths.gameCachePath, 'files', 'Datas', `${filename}.bf1`);
	}

	getTargetFolder(): string {
		return pathResolve(paths.gameCachePath, 'files', 'Datas');
	}

	async loadHashes(): Promise<Record<string, string>> {
		return (await axios.get<Record<string, string>>('http://cru.gslb.toastoven.net/Asset/Real/DataSheet/sha1.json')).data;
	}
}
