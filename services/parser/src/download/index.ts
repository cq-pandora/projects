import DataDownloader from './DataDownloader';
import AssetsDownloader from './AssetsDownloader';

export async function downloadData(): Promise<void> {
	await new DataDownloader().execute();
}

export async function downloadAssets(): Promise<void> {
	await new AssetsDownloader().execute();
}
