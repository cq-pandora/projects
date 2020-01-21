import { resolve } from 'path';
import { readFileSync } from 'fs';

function readJSON(cfg: string): any {
	return JSON.parse(readFileSync(resolve(process.cwd(), `${cfg}.json`), 'utf-8'));
}

type Glob = string;
type Collections = Record<string, Glob[]>;

type ImagesCollections = Record<number, Collections>;

const configRaw = readJSON('images-collections');

export const images: ImagesCollections = configRaw;

interface IPaths {
	readonly unity: string;
	readonly unitySpriteSplitter: string;
	readonly gameCachePath: string;
	readonly decryptOutputDir: string;
	readonly spritesOutputDir: string;
	readonly informationOutputDir: string;
}

const pathsRaw = readJSON('paths');

export const paths: IPaths = {
	decryptOutputDir: pathsRaw.decrypt_output_dir,
	gameCachePath: pathsRaw.game_cache_path,
	informationOutputDir: pathsRaw.information_output_dir,
	spritesOutputDir: pathsRaw.sprites_output_dir,
	unity: pathsRaw.unity_executable,
	unitySpriteSplitter: pathsRaw.unity_sprite_splitter,
};

interface ICrypto {
	readonly key: string;
	readonly iv: string;
}

export const crypto = readJSON('crypto') as ICrypto;
