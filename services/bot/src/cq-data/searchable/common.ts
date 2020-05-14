import Fuse from 'fuse.js';

import { TranslationIndex, TranslationIndexSection } from '@pandora/entities';

import { ContextType } from '../../common-types';

export type Entities = any;

export type Container<T> = T[] | Record<string, T>;

export type HeroKeysDescription = Record<string, string>;

export interface ISearchable<T extends Entities, C extends Container<T>> {
	list(): T[];
	structure(): C;
	search(query: string): T;
	searchAll(query: string): T[];
}

export type FuseOptions = Fuse.FuseOptions<TranslationIndex>;

export const fuzzyOptions = {
	threshold: 0.3,
	location: 0,
	distance: 100,
	maxPatternLength: 32,
	minMatchCharLength: 1,
	keys: ['text']
} as FuseOptions;

const contextToSectionDictionary = {
	heroes: 'heroes',
	champions: 'champions',
	sp: 'sp_skills',
	bosses: 'bosses',
	breads: 'breads',
	berries: 'berries',
	sigils: 'sigils',
	goddesses: 'goddesses',
	factions: 'factions',
	fishes: 'fishes',
	'fish-gear': 'fishing_gear',
	portraits: 'portraits',
} as Record<ContextType, TranslationIndexSection>;

export function contextToSection(context: ContextType): TranslationIndexSection {
	const section = contextToSectionDictionary[context];

	if (!section) {
		throw new Error(`No translation section for context '${context}'`);
	}

	return section;
}
