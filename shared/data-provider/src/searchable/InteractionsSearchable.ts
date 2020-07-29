import { Interaction } from '@cquest/entities';

import { ISearchable, ISearchResult } from './common';

export class InteractionsSearchable implements ISearchable<Interaction, Interaction[]> {
	private entities?: Interaction[];
	private initialized = false;

	init(entities: Interaction[]): void {
		this.entities = entities;
		this.initialized = true;
	}

	list(): Interaction[] {
		if (!this.initialized) {
			throw new Error('This searchable instance has not been initialized');
		}

		return this.entities!;
	}

	search(query: string): ISearchResult<Interaction> {
		return this.searchAll(query)[0];
	}

	searchAll(query: string): ISearchResult<Interaction>[] {
		if (!this.initialized) {
			throw new Error('This searchable instance has not been initialized');
		}

		return this.entities!
			.filter(e => Boolean(e.actors.filter(a => a.id === query).length))
			.map(e => ({
				locales: ['generic'],
				result: e,
			}));
	}

	structure(): Interaction[] {
		if (!this.initialized) {
			throw new Error('This searchable instance has not been initialized');
		}

		return this.entities!;
	}
}
