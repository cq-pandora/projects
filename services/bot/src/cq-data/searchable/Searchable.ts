import Fuse from 'fuse.js';

import { TranslationIndex } from '@pandora/entities';

import { ContextType } from '../../common-types';
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

	search(query: string): ISearchResult<T> {
		return this.searchAll(query)[0];
	}

	searchAll(rawQuery: string): ISearchResult<T>[] {
		const query = alias(this.context, rawQuery);

		const queryResult = this.fuse.search<TranslationIndex, false, false>(query);

		return queryResult
			.map(({ path: paths, locale }: TranslationIndex): ISearchResult<T>[] => (
				paths.split(',').map(path => {
					const [key] = path.split('.');

					return {
						// @ts-ignore
						result: this.entities[key],
						locale,
					};
				})
			))
			.flat(1)
			.sort((a, b) => Number(b.locale === DEFAULT_LOCALE) - Number(a.locale === DEFAULT_LOCALE));
	}
}
