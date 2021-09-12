import gpScraper from 'google-play-scraper';

export const GAME_PACKAGE_NAME = 'com.nhnent.SKQUEST';

export const resolveVersion = async (packageName = GAME_PACKAGE_NAME): Promise<string> => {
	const scrap = await gpScraper.app({ appId: packageName });

	return scrap.version;
};
