import DataDownloader from './DataDownloader';
import AssetsDownloader from './AssetsDownloader';
import { getRootDownloadPath } from './utils';
import { makeLogger } from '../logger';
import { apkVersion } from '../util';

let rootUrl: string | undefined;
const logger = makeLogger('data.init');

export async function initData(): Promise<void> {
	const version = await apkVersion();
	rootUrl = await getRootDownloadPath();

	logger.info(`Using game version ${version} with url ${rootUrl}`);
}

export async function downloadData(): Promise<void> {
	if (!rootUrl) {
		throw new Error('Root URL not initialized');
	}

	await new DataDownloader({ versionUrl: rootUrl }).execute();
}

export async function downloadAssets(): Promise<void> {
	if (!rootUrl) {
		throw new Error('Root URL not initialized');
	}

	await new AssetsDownloader({ versionUrl: rootUrl }).execute();
}
