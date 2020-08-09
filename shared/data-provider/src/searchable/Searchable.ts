import fuzzysort from 'fuzzysort';
import uniq from 'array-unique';

import { TranslationIndex } from '@cquest/entities';

import {
	Entities, Container, ISearchable, ISearchResult
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

type Cooked<T> = {
	prepared: Fuzzysort.Prepared;
	original: T;
};

interface IHasScore {
	score: number;
}

const arraySortingFunction = (a: IHasScore, b: IHasScore): number => b.score - a.score;

export class Searchable<T extends Entities, C extends Container<T>> implements ISearchable<T, C> {
	private searcher?: Fuzzysort.Fuzzysort;
	private entities?: C;
	private alias?: ISearchableAliasProvider;
	private entitiesList?: T[];
	private cooked?: Cooked<TranslationIndex>[];
	private initialized = false;

	async init(resolvable: PromiseResolvable<ISearchableOptions<T, C>>): Promise<void> {
		const options = await resolvable;

		this.searcher = fuzzysort.new({
			threshold: -1000,
			limit: Infinity,
			allowTypo: true,
		});

		this.entities = options.entities;
		this.alias = options.alias;
		this.entitiesList = Array.isArray(this.entities) ? this.entities : Object.values(this.entities);
		this.cooked = options.index.map(e => ({
			original: e,
			prepared: fuzzysort.prepare(e.text)!
		}));

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
		const q = this.searchAll(query);

		return q[0];
	}

	searchAll(rawQuery: string): ISearchResult<T>[] {
		if (!this.initialized) {
			throw new Error('This searchable instance has not been initialized');
		}

		const query = this.alias!(rawQuery);

		// const queryResult = this.fuse!.search<TranslationIndex, true>(query);
		const queryResult = this.searcher!.go(query, this.cooked!, {
			key: 'prepared'
		});

		const rawResults = {} as RawStructure<T>;

		for (const q of queryResult) {
			const {
				obj: {
					original: {
						path: paths,
						locale,
					},
				},
				score,
			} = q;

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

		const cookedResults = Object.values(rawResults)
			.map(r => ({
				result: r.entity,
				locales: uniq(r.locales).sort(
					(a, b) => Number(b === DEFAULT_LOCALE) - Number(a === DEFAULT_LOCALE)
				),
				score: r.score,
			}));

		const prioritized = [] as (typeof cookedResults[number])[];
		const others = [] as (typeof cookedResults[number])[];

		for (const cr of cookedResults) {
			if (cr.locales[0] === DEFAULT_LOCALE) {
				prioritized.push(cr);
			} else {
				others.push(cr);
			}
		}

		return prioritized
			.sort(arraySortingFunction)
			.concat(
				others.sort(arraySortingFunction)
			);
	}
}
