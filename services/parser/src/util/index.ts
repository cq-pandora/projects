import { IStatsHolder, Stats } from '@pandora/entities';
import { promisify } from 'util';
import { readFile } from 'fs';
import { resolve as pathResolve } from 'path';

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
