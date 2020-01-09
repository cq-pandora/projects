import { IStatsHolder, Stats } from '@pandora/entities';
import { promisify } from 'util';
import { readFile } from 'fs';
import axios from 'axios';

const GAME_VERSION_URL = 'https://apkpure.com/crusaders-quest/com.nhnent.SKQUEST';
const GAME_VERSION_REGEX = /<span\s+itemprop="version">\s*(\d+\.\d+\.\d+).*<\/span>/;

const readFileAsync = promisify(readFile);

export async function readJSON(filename: string): Promise<object> {
	return JSON.parse(await readFileAsync(filename, 'utf-8'));
}

let gameVersionCached: string | undefined;

export async function gameVersion(): Promise<string> {
	if (!gameVersionCached) {
		const page = await axios.get(GAME_VERSION_URL);
		[, gameVersionCached] = page.data.match(GAME_VERSION_REGEX);
	}

	return gameVersionCached as string;
}

type Grouped<T> = Record<string, T[]>;

export function groupBy<T>(arr: T[], field: keyof T): Grouped<T> {
	return arr.reduce(
		(r, v) => {
			const k = v[field];

			// @ts-ignore
			(r[k] = r[k] || []).push(v);

			return r;
		},
		{} as Grouped<T>
	);
}

type HasId = {
	id: string | number;
	[key: string]: any;
};

export function arrayToId<T extends HasId>(array: T[]): Record<string | number, T> {
	return array.reduce((r, e) => {
		r[e.id] = e;

		return r;
	}, {} as Record<string | number, T>);
}

export function sumStats(stat1: IStatsHolder, stat2: IStatsHolder): IStatsHolder {
	const stats = {} as IStatsHolder;

	for (const stat of Object.keys(stat1 || {})) {
		const statName = stat as Stats;

		stats[statName] = (stat1[statName] || 0) + (stat2[statName] || 0);
	}

	return stats;
}

export { default as parseTK2D, ITK2DObject } from './parse';
