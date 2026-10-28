import { join, resolve } from 'node:path';

// Imported before anything that loads the bot config, which reads these variables once on import

const [assetsArg, baseRefArg] = process.argv.slice(2);

if (!assetsArg) {
	throw new Error('Usage: node lib/validate-data <assets dir> [<base git ref>]');
}

export const IMAGES_URL = 'https://data.fenrir.moe/';
export const assetsDir = resolve(assetsArg);
export const informationDir = join(assetsDir, 'information');
export const baseRef: string | undefined = baseRefArg;

process.env.PANDORA_URL_IMAGES_PREFIX = IMAGES_URL;
process.env.PANDORA_IMAGES_SUFFIX = '.png';
process.env.PANDORA_LOCAL_IMAGES_PREFIX = assetsDir;
process.env.PANDORA_CQ_NORMALIZED_DATA_PATH = informationDir;
