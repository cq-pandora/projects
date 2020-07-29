import Fuse from 'fuse.js';
import uniq from 'array-unique';

import { TranslationIndex } from '@cquest/entities';

import {
	Entities, Container, ISearchable, FuseOptions, fuzzyOptions, ISearchResult
} from './common';

export interface ISearchableAliasProvider {
	(key: string): string;
}

export type PromiseResolvable<T> = Promise<T> | T;

export interface ISearchableOptions<T extends Entities, C extends Container<T>> {
	alias: ISearchableAliasProvider;
	entities: C;
	index: TranslationIndex[];
}

const DEFAULT_LOCALE = 'en_us';

type RawStructure<E> = Record<string, { entity: E; locales: string[]; score: number }>;

export class Searchable<T extends Entities, C extends Container<T>> implements ISearchable<T, C> {
	private fuse?: Fuse<TranslationIndex, FuseOptions>;
	private entities?: C;
	private alias?: ISearchableAliasProvider;
	private entitiesList?: T[];
	private initialized = false;

	async init(resolvable: PromiseResolvable<ISearchableOptions<T, C>>): Promise<void> {
		const options = await resolvable;

		this.fuse = new Fuse<TranslationIndex, FuseOptions>(
			options.index,
			fuzzyOptions
		);

		this.entities = options.entities;
		this.alias = options.alias;
		this.entitiesList = Array.isArray(this.entities) ? this.entities : Object.values(this.entities);

		this.initialized = true;
	}

	list(): T[] {
		if (!this.initialized) {
			throw new Error('This searchable instance has not been initialized');
		}

		return this.entitiesList!;
	}

	structure(): C {
		if (!this.initialized) {
			throw new Error('This searchable instance has not been initialized');
		}

		return this.entities!;
	}

	search(query: string): ISearchResult<T> | undefined {
		return this.searchAll(query)[0];
	}

	searchAll(rawQuery: string): ISearchResult<T>[] {
		if (!this.initialized) {
			throw new Error('This searchable instance has not been initialized');
		}

		const query = this.alias!(rawQuery);

		const queryResult = this.fuse!.search<TranslationIndex, true>(query);

		const rawResults = {} as RawStructure<T>;

		for (const q of queryResult) {
			const { item: { path: paths, locale }, score } = q;

			for (const path of paths.split(',')) {
				const [key] = path.split('.');

				if (!rawResults[key]) {
					rawResults[key] = {
						// @ts-expect-error Just to unify index types. May be move to Map
						entity: this.entities![key],
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
