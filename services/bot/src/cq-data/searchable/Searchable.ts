import Fuse from 'fuse.js';
import uniq from 'array-unique';

import { TranslationIndex, ContextType } from '@cquest/entities';

import config from '../../config';

import {
	Entities, Container, ISearchable, FuseOptions, fuzzyOptions, ISearchResult
} from './common';

const alias = (ctx: ContextType, key: string): string => (
	key
		? config.aliases.get(ctx, key.toLowerCase()) || key
		: ''
);

export interface ISearchableOptions<T extends Entities, C extends Container<T>> {
	context: ContextType;
	entities: C;
	index: TranslationIndex[];
}

const DEFAULT_LOCALE = 'en_us';

type RawStructure<E> = Record<string, { entity: E; locales: string[]; score: number }>;

export class Searchable<T extends Entities, C extends Container<T>> implements ISearchable<T, C> {
	private readonly fuse: Fuse<TranslationIndex, FuseOptions>;
	private readonly entities: C;
	private readonly context: ContextType;
	private readonly entitiesList: T[];

	constructor(options: ISearchableOptions<T, C>) {
		this.fuse = new Fuse<TranslationIndex, FuseOptions>(
			options.index,
			fuzzyOptions
		);

		this.entities = options.entities;
		this.context = options.context;
		this.entitiesList = Array.isArray(this.entities) ? this.entities : Object.values(this.entities);
	}

	list(): T[] { return this.entitiesList; }

	structure(): C { return this.entities; }

	search(query: string): ISearchResult<T> | undefined {
		return this.searchAll(query)[0];
	}

	searchAll(rawQuery: string): ISearchResult<T>[] {
		const query = alias(this.context, rawQuery);

		const queryResult = this.fuse.search<TranslationIndex, true>(query);

		const rawResults = {} as RawStructure<T>;

		for (const q of queryResult) {
			const { item: { path: paths, locale }, score } = q;

			for (const path of paths.split(',')) {
				const [key] = path.split('.');

				if (!rawResults[key]) {
					rawResults[key] = {
						// @ts-ignore
						entity: this.entities[key],
						locales: [locale],
						score,
					};
				} else {
					rawResults[key].score = Math.max(score, rawResults[key].score);
					rawResults[key].locales.push(locale);
				}
			}
		}

		return Object.values(rawResults)
			.map(r => ({
				result: r.entity,
				locales: uniq(r.locales).sort(
					(a, b) => Number(b === DEFAULT_LOCALE) - Number(a === DEFAULT_LOCALE)
				),
				score: r.score,
			}))
			.sort((a, b) => {
				// Default locale will be first if exists
				const aHasEnglish = a.locales[0] === DEFAULT_LOCALE;
				const bHasEnglish = b.locales[0] === DEFAULT_LOCALE;

				if (aHasEnglish === bHasEnglish) {
					return a.score - b.score;
				}

				return Number(bHasEnglish) - Number(aHasEnglish);
			});
	}
}
