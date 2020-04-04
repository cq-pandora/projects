import Fuse from 'fuse.js';
import { join as pathJoin } from 'path';
import { readFileSync } from 'fs';

import {
	Hero, Berry, Champion, SpSkill, Boss, Bread, Sigil, Goddess, Faction, Inheritance, Fish, FishingGear,
	Portrait, TranslationIndexSection, TranslationIndices, Deserialize, DeserializeSingle, TranslationIndex,
	Translations, GenericConstructor, Interaction
} from '@pandora/entities';

import { ContextType } from './common-types';
import config from './config';

type Entities = any;

type HeroKeysDescription = Record<string, string>;

const loadInfo = (path: string): string => readFileSync(pathJoin(config.parsedData, `${path}.json`), { encoding: 'utf-8' });

const translationIndices = DeserializeSingle<TranslationIndices>(loadInfo('translations_indices'), 'TranslationIndices');

export const translations = DeserializeSingle<Translations>(loadInfo('translations'), 'Translations');

const alias = (ctx: ContextType, key: string): string => (
	key
		? config.aliases.get(ctx, key.toLowerCase()) || key
		: ''
);

type FuseOptions = Fuse.FuseOptions<TranslationIndex>;

const fuzzyOptions = {
	threshold: 0.3,
	location: 0,
	distance: 100,
	maxPatternLength: 32,
	minMatchCharLength: 1,
	keys: ['text']
} as FuseOptions;

function contextToSection(context: ContextType): TranslationIndexSection {
	switch (context) {
		case 'heroes': return 'heroes';
		case 'champions': return 'champions';
		case 'sp': return 'sp_skills';
		case 'bosses': return 'bosses';
		case 'breads': return 'breads';
		case 'berries': return 'berries';
		case 'sigils': return 'sigils';
		case 'goddesses': return 'goddesses';
		case 'factions': return 'factions';
		case 'fishes': return 'fishes';
		case 'fish-gear': return 'fishing_gear';
		case 'portraits': return 'portraits';
		default: throw new Error(`No translation section for context '${context}'`);
	}
}

type Container<T> = T[] | Record<string, T>;

interface ISearchable<T extends Entities, C extends Container<T>> {
	list(): T[];
	structure(): C;
	search(query: string): T;
	searchAll(query: string): T[];
}

class Searchable<T extends Entities, C extends Container<T>> implements ISearchable<T, C> {
	private readonly fuse: Fuse<TranslationIndex, FuseOptions>;
	private readonly entities: C;
	private readonly section: TranslationIndexSection;
	private readonly context: ContextType;
	private readonly entitiesList: T[];

	constructor(context: ContextType, entities: C) {
		this.section = contextToSection(context);

		this.fuse = new Fuse<TranslationIndex, FuseOptions>(
			translationIndices[this.section],
			fuzzyOptions
		);

		this.entities = entities;
		this.context = context;
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

		return queryResult.map(({ path }: TranslationIndex): T => {
			const [key] = path.split('.');

			// @ts-ignore
			return this.entities[key];
		});
	}
}

class InteractionsSearchable implements ISearchable<Interaction, Interaction[]> {
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

export function translate(keyRaw?: string): string {
	if (!keyRaw) return '';

	const key = keyRaw.toUpperCase();

	if (key in translations) {
		return translations[key].text.replace(/[@#$^]/g, '');
	}

	return key;
}

function arraySearchable<T extends Entities>(
	cxt: ContextType,
	ctor: GenericConstructor<T>,
	filename?: string
): Searchable<T, T[]> {
	return new Searchable<T, T[]>(cxt, Deserialize(loadInfo(filename || cxt), ctor));
}

export const berries = arraySearchable('berries', Berry);
export const bosses = arraySearchable('bosses', Boss);
export const breads = arraySearchable('breads', Bread);
export const champions = arraySearchable('champions', Champion);
export const goddesses = arraySearchable('goddesses', Goddess);
export const heroes = arraySearchable('heroes', Hero);
export const sigils = arraySearchable('sigils', Sigil);
export const factions = arraySearchable('factions', Faction);
export const spSkills = arraySearchable('sp', SpSkill, 'sp_skills');
export const fishes = arraySearchable('fishes', Fish);
export const fishingGear = arraySearchable('fish-gear', FishingGear, 'fishing_gear');
export const interactions = new InteractionsSearchable(
	Deserialize(loadInfo('interactions'), Interaction)
);

export const inheritance = DeserializeSingle<Inheritance>(loadInfo('inheritance'), 'Inheritance');

function objectSearchable<T extends Entities>(cxt: ContextType, ctor: string): Searchable<T, Record<string, T>> {
	return new Searchable<T, Record<string, T>>(cxt, DeserializeSingle(loadInfo(cxt), ctor) as Record<string, T>);
}

export const portraits = objectSearchable<Portrait>('portraits', 'Portraits');

export const heroKeysDescription = JSON.parse(loadInfo('heroes_translations_indices')) as HeroKeysDescription;
