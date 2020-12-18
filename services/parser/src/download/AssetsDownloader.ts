import { Entry as ZipEntry, Parse as ZipParse } from 'unzipper';
import glob from 'glob';
import { ungzip } from 'node-gzip';
import streamToParts from 'stream-to-array';

import { createWriteStream } from 'fs';
import { resolve as pathResolve } from 'path';

import AbstractDownloader from './AbstractDownloader';
import { images, paths } from '../config';

async function streamToString(stream: ZipEntry): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		const chunks: string[] = [];
		stream.on('data', (chunk) => {
			chunks.push(chunk.toString());
		});
		stream.on('end', () => {
			resolve(chunks.join(''));
		});
		stream.on('error', reject);
	});
}

const patterns: string[] = [];

for (const [, types] of Object.entries(images)) {
	for (const [, pattern] of Object.entries(types)) {
		patterns.push(...pattern);
	}
}

export interface IAssetsDownloaderOptions {
	versionUrl: string
}

export default class AssetsDownloader extends AbstractDownloader {
	constructor({ versionUrl }: IAssetsDownloaderOptions) {
		super({
			loggerName: 'download.assets',
			baseUrl: `http://${versionUrl}Android/`,
			skipHashCheck: true,
		});
	}

	async calculateHash(): Promise<string> {
		// FIXME actually calculate hash
		return 'TODO';
	}

	getDownloadFileName(filename: string): string {
		return `${filename}.gz`;
	}

	getFilePath(filename: string): string {
		return pathResolve(paths.gameCachePath, 'files', 'Assets', `${filename}`);
	}

	getTargetFolder(): string {
		return pathResolve(paths.gameCachePath, 'files', 'Assets');
	}

	protected async download(path: string, filename: string): Promise<void> {
		const writer = createWriteStream(path);

		const response = await this.fileDownloadInstance.get(this.getDownloadFileName(filename));
		const parts = await streamToParts(response.data);

		const responseBuffer = Buffer.concat(parts.map(p => Buffer.from(p)));

		const ungzipped = await ungzip(responseBuffer);

		writer.write(ungzipped);
		writer.close();
	}

	private getRegexes(): RegExp[] {
		return patterns.map(pattern => new glob.Glob(pattern).minimatch.makeRe());
	}

	async loadHashes(): Promise<Record<string, string>> {
		const bundlelist = await this.fileDownloadInstance.get('bundlelist.zz');

		const zip = bundlelist.data.pipe(ZipParse({ forceStream: true }));

		for await (const e of zip) {
			const entry = e as ZipEntry;
			const fileName = entry.path;

			if (fileName !== 'bundlelist.txt') {
				entry.autodrain();
				continue;
			}

			const map = JSON.parse(await streamToString(entry));

			const res = {} as Record<string, string>;

			const matchers = this.getRegexes();

			for (const [filename, hashObj] of Object.entries(map)) {
				const isNeeded = matchers.some(r => r.test(filename));

				if (!isNeeded) continue;

				const { h, c, x } = hashObj as any;

				res[filename] = `${h}.${c}.${x}`;
			}

			return res;
		}

		throw new TypeError('bundlelist.txt was not present');
	}
}
