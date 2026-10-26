import { crc32 } from 'crc';

import { promises as fsPromises } from 'node:fs';
import { resolve as pathResolve } from 'node:path';

import AbstractDownloader from './AbstractDownloader';
import { paths } from '../config';
import { streamToString } from '../util';

const { readFile } = fsPromises;

export interface IDataDownloaderOptions {
	baseUrl: string;
}

export default class DataDownloader extends AbstractDownloader {
	constructor({ baseUrl }: IDataDownloaderOptions) {
		super({
			loggerName: 'download.data',
			baseUrl,
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
		return JSON.parse(await streamToString((await this.fileDownloadInstance.get('sha1.json')).data));
	}
}
