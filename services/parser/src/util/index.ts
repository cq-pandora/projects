import { IStatsHolder, Stats } from '@cquest/entities';
import { promisify } from 'util';
import { readFile } from 'fs';
import { resolve as pathResolve } from 'path';
import gpScraper from 'google-play-scraper';
import ReadableStream = NodeJS.ReadableStream;

import { paths } from '../config';

const readFileAsync = promisify(readFile);

export async function readJSON(filename: string): Promise<object> {
	return JSON.parse(await readFileAsync(filename, 'utf-8'));
}

let gameVersionCached: string | undefined;

interface IGameVersion {
	status: string;
	version: {
		client: string;
		server: string;
		data: string;
		lastupdatetime: string;
		id: string;
	}[];
}

export async function gameVersion(): Promise<string> {
	if (!gameVersionCached) {
		const versionJson = await readJSON(pathResolve(paths.decryptOutputDir, 'get_versions.json')) as IGameVersion;

		gameVersionCached = versionJson.version[0].data;
	}

	return gameVersionCached as string;
}

let apkVersionCached: string | undefined;

export async function apkVersion(): Promise<string> {
	if (!apkVersionCached) {
		const scrap = await gpScraper.app({ appId: 'com.nhnent.SKQUEST' });

		apkVersionCached = scrap.version;
	}

	return apkVersionCached;
}

type Grouped<T> = Record<keyof T, T[]>;

export function groupBy<T>(arr: T[], field: keyof T): Grouped<T> {
	return arr.reduce(
		(r: Grouped<T>, v: T) => {
			const k = v[field];

			// @ts-expect-error Shorthand
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

export function growStats(base: number, growth: number, level: number): number {
	return base + growth * (level - 1);
}

export function streamToString(stream: ReadableStream): Promise<string> {
	const chunks: Uint8Array[] = [];
	return new Promise((resolve, reject) => {
		stream.on('data', chunk => chunks.push(chunk));
		stream.on('error', reject);
		stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
	})
}
