import { crc32 } from 'crc';
import axios from 'axios';
import mkdirp from 'mkdirp';

import { resolve as pathResolve } from 'path';
import { promises as fsPromises, createWriteStream } from 'fs';

import { paths } from '../config';
import { makeLogger } from '../logger';

const { readFile, access } = fsPromises;
const logger = makeLogger('download.data');

type FileHashes = Record<string, string>;

const fileDownloadInstance = axios.create({
	baseURL: 'http://cru.gslb.toastoven.net/Asset/Real/DataSheet/',
	responseType: 'stream'
});

async function downloadHashes(): Promise<FileHashes> {
	return (await axios.get<FileHashes>('http://cru.gslb.toastoven.net/Asset/Real/DataSheet/sha1.json')).data;
}

async function calculateHash(filepath: string): Promise<string> {
	const contents = await readFile(filepath, null);

	return crc32(contents).toString(16).toUpperCase().padStart(8, '0');
}

async function exists(path: string): Promise<boolean> {
	try {
		await access(path);

		return true;
	} catch (err) {
		return false;
	}
}

async function download(path: string, filename: string): Promise<void> {
	const writer = createWriteStream(path);

	const response = await fileDownloadInstance.get(`${filename}.data`);

	response.data.pipe(writer);

	return new Promise<void>((resolve, reject) => {
		writer.on('end', reject);
		writer.on('finish', resolve);
	});
}

async function downloadAsset(filename: string, targetHash: string): Promise<void> {
	const filepath = pathResolve(paths.gameCachePath, 'files', 'Datas', `${filename}.bf1`);

	let attempt = 0;

	while (++attempt <= 5) {
		try {
			await download(filepath, filename);
		} catch (e) {
			logger.warn(`${filename}: Attempt ${attempt} failed`, e.message);
			continue;
		}

		const hash = await calculateHash(filepath);

		if (hash === targetHash) {
			break;
		}

		logger.warn(`${filename}: Attempt ${attempt} failed. Invalid hash ${hash} !== ${targetHash}`);
	}

	if (attempt === 5) {
		throw new Error(`Unable to download ${filename} after 5 attempts. Giving up`);
	}
}

export default async function downloadData(): Promise<void> {
	const fileHashes = await downloadHashes();
	const datasPath = pathResolve(paths.gameCachePath, 'files', 'Datas');

	mkdirp.sync(datasPath);

	await Promise.allSettled(Object.entries(fileHashes).map(async ([filename, targetHash]) => {
		if (filename === 'id') return;

		const filepath = pathResolve(datasPath, `${filename}.bf1`);

		let needsDownload = false;

		if (await exists(filepath)) {
			const hash = await calculateHash(filepath);

			if (hash !== targetHash) {
				logger.info(`${filename} hash mismatch. Downloading...`);
				needsDownload = true;
			} else {
				logger.verbose(`${filename} hash matches. Ignoring...`);
			}
		} else {
			logger.info(`${filename} does not exist. Downloading...`);
			needsDownload = true;
		}

		if (needsDownload) {
			try {
				await downloadAsset(filename, targetHash);
				logger.info(`${filename} downloaded successfully`);
			} catch (err) {
				logger.warn(err.message);
			}
		}
	}));
}
