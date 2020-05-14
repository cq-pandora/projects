import Fuse from 'fuse.js';

import { TranslationIndex } from '@pandora/entities';

import { ContextType } from '../../common-types';
import config from '../../config';

import {
	Entities, Container, ISearchable, FuseOptions, fuzzyOptions
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

	search(query: string): T {
		return this.searchAll(query)[0];
	}

	searchAll(rawQuery: string): T[] {
		const query = alias(this.context, rawQuery);

		const queryResult = this.fuse.search<TranslationIndex, false, false>(query);

		return queryResult.map(({ path: paths }: TranslationIndex): T[] => (
			paths.split(',').map(path => {
				const [key] = path.split('.');

				// @ts-ignore
				return this.entities[key];
			})
		)).flat();
	}
}
