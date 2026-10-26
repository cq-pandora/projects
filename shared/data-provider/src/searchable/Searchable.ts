import fuzzysort, { SnapshotKey } from 'fuzzysort';

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

interface IHasScore {
	score: number;
}

const arraySortingFunction = (a: IHasScore, b: IHasScore): number => b.score - a.score;

export class Searchable<T extends Entities, C extends Container<T>> implements ISearchable<T, C> {
	private entities?: C;
	private alias?: ISearchableAliasProvider;
	private entitiesList?: T[];
	private snapshot?: SnapshotKey<TranslationIndex>;
	private initialized = false;

	async init(resolvable: PromiseResolvable<ISearchableOptions<T, C>>): Promise<void> {
		const options = await resolvable;

		this.entities = options.entities;
		this.alias = options.alias;
		this.entitiesList = Array.isArray(this.entities) ? this.entities : Object.values(this.entities);
		this.snapshot = fuzzysort.snapshot(options.index, { key: 'text' });

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

		// fuzzysort returns every target for an empty query
		if (!query) return [];

		// Default threshold (0.5) matches closest what fuzzysort 1 returned with `threshold: -1000`; 0 = no limit
		const queryResult = fuzzysort.go(query, this.snapshot!, { limit: 0 });

		const rawResults = {} as RawStructure<T>;

		for (const q of queryResult) {
			const {
				obj: {
					path: paths,
					locale,
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
				locales: [...new Set(r.locales)].sort(
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
