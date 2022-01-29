import axios, { AxiosInstance } from 'axios';
import mkdirp from 'mkdirp';
import asyncPool from 'tiny-async-pool';

import { promises as fsPromises, createWriteStream } from 'fs';

import { makeLogger, Logger } from '../logger';

const { access } = fsPromises;

interface IDownloaderOptions {
	loggerName: string;
	baseUrl: string;
	skipHashCheck?: boolean;
	concurrent?: number;
}

export default abstract class AbstractDownloader {
	protected readonly fileDownloadInstance: AxiosInstance;
	protected readonly logger: Logger;
	protected readonly skipHashCheck: boolean;
	protected readonly poolSize: number;

	protected constructor(options: IDownloaderOptions) {
		const {
			loggerName, baseUrl, skipHashCheck, concurrent
		} = options;

		this.logger = makeLogger(loggerName);

		this.fileDownloadInstance = axios.create({
			baseURL: baseUrl,
			responseType: 'stream',
			headers: {
				'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 9; SM-G960F Build/R16NW)',
				'X-Unity-Version': '2018.4.31f1',
				'Accept-Encoding': 'gzip'
			},
		});

		this.skipHashCheck = skipHashCheck ?? false;
		this.poolSize = concurrent ?? 5;
	}

	abstract loadHashes(): Promise<Record<string, string>>;

	abstract calculateHash(filepath: string): Promise<string>;

	abstract getFilePath(filename: string): string;

	abstract getDownloadFileName(filename: string): string;

	abstract getTargetFolder(): string;

	async exists(path: string): Promise<boolean> {
		try {
			await access(path);

			return true;
		} catch (err) {
			return false;
		}
	}

	protected async download(path: string, filename: string): Promise<void> {
		const writer = createWriteStream(path);

		const response = await this.fileDownloadInstance.get(this.getDownloadFileName(filename));

		response.data.pipe(writer);

		return new Promise<void>((resolve, reject) => {
			writer.on('end', reject);
			writer.on('finish', resolve);
		});
	}

	protected async downloadAsset(filename: string, targetHash: string): Promise<void> {
		const filepath = this.getFilePath(filename);

		let attempt = 0;

		while (++attempt <= 5) {
			try {
				await this.download(filepath, filename);
			} catch (e: any) {
				this.logger.warn(`${filename}: Attempt ${attempt} failed: ${e.message}`);
				continue;
			}

			const hash = await this.calculateHash(filepath);

			if (hash === targetHash || this.skipHashCheck) {
				return;
			}

			this.logger.warn(`${filename}: Attempt ${attempt} failed. Invalid hash ${hash} !== ${targetHash}`);
		}

		throw new Error(`Unable to download ${filename} after 5 attempts. Giving up`);
	}

	async execute(): Promise<void> {
		const fileHashes = await this.loadHashes();

		mkdirp.sync(this.getTargetFolder());

		await asyncPool(this.poolSize, Object.entries(fileHashes), async ([filename, targetHash]) => {
			if (filename === 'id') return;

			const filepath = this.getFilePath(filename);

			let needsDownload = false;

			if (await this.exists(filepath)) {
				const hash = await this.calculateHash(filepath);

				if (hash !== targetHash) {
					this.logger.info(`${filename} hash mismatch. Downloading...`);
					needsDownload = true;
				} else {
					this.logger.verbose(`${filename} hash matches. Ignoring...`);
				}
			} else {
				this.logger.info(`${filename} does not exist. Downloading...`);
				needsDownload = true;
			}

			if (needsDownload) {
				try {
					await this.downloadAsset(filename, targetHash);
					this.logger.info(`${filename} downloaded successfully`);
				} catch (err: any) {
					this.logger.error(err.message);
				}
			}
		});
	}
}
