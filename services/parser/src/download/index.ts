import DataDownloader from './DataDownloader';
import AssetsDownloader from './AssetsDownloader';
import { getGameUrls, GameUrls } from './utils';
import { makeLogger } from '../logger';
import { apkVersion } from '../util';

let urls: GameUrls | undefined;
const logger = makeLogger('data.init');

function gameUrls(): GameUrls {
	if (!urls) {
		throw new Error('Game URLs not initialized');
	}

	return urls;
}

export async function initData(): Promise<void> {
	const version = await apkVersion();
	urls = await getGameUrls();

	logger.info(`Using game version ${version} with data ${urls.dataSheet} and assets ${urls.assets}`);
}

export async function downloadData(): Promise<void> {
	await new DataDownloader({ baseUrl: gameUrls().dataSheet }).execute();
}

export async function downloadAssets(): Promise<void> {
	await new AssetsDownloader({ baseUrl: `${gameUrls().assets}Android/` }).execute();
}
