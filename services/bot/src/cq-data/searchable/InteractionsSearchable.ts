import { Interaction } from '@pandora/entities';

import { ISearchable } from './common';

export class InteractionsSearchable implements ISearchable<Interaction, Interaction[]> {
	private readonly entities: Interaction[];

	constructor(entities: Interaction[]) {
		this.entities = entities;
	}

	list(): Interaction[] {
		return this.entities;
	}

	search(query: string): Interaction {
		return this.searchAll(query)[0];
	}

	searchAll(query: string): Interaction[] {
		return this.entities.filter(e => Boolean(e.actors.filter(a => a.id === query).length));
	}

	structure(): Interaction[] {
		return this.entities;
	}
}
