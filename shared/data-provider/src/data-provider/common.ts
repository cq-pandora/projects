import {
	Berry, Boss, Bread, Champion, Faction, Fish, FishingGear, Goddess, Hero, Inheritance, Interaction, Portrait,
	Sigil, SpSkill, TranslationIndices, Scarecrow
} from '@cquest/entities';

import { IDataSource } from '../data-source';
import {
	Entities, HeroKeysDescription, ISearchable, IAliasProvider
} from '../searchable';
import { Locale, Localizations } from '../common';

type ArraySearchable<T extends Entities> = ISearchable<T, T[]>;
type ObjectSearchable<T extends Entities> = ISearchable<T, Record<string, T>>;

export interface IDataProvider {
	readonly berries: ArraySearchable<Berry>;
	readonly bosses: ArraySearchable<Boss>;
	readonly breads: ArraySearchable<Bread>;
	readonly champions: ArraySearchable<Champion>;
	readonly goddesses: ArraySearchable<Goddess>;
	readonly heroes: ArraySearchable<Hero>;
	readonly sigils: ArraySearchable<Sigil>;
	readonly factions: ArraySearchable<Faction>;
	readonly spSkills: ArraySearchable<SpSkill>;
	readonly fishes: ArraySearchable<Fish>;
	readonly fishingGear: ArraySearchable<FishingGear>;
	readonly interactions: ArraySearchable<Interaction>;
	readonly scarecrows: ArraySearchable<Scarecrow>;
	readonly portraits: ObjectSearchable<Portrait>;

	readonly inheritance: Inheritance;
	readonly heroKeysDescription: HeroKeysDescription;

	readonly translationIndices: TranslationIndices;
	readonly locales: Locale[];
	readonly localizations: Localizations;

	init(): Promise<unknown>;
	reinit(): Promise<unknown>;

	getDataSource(): IDataSource | undefined;
	setDataSource(dataSource: IDataSource): unknown;

	getAliasProvider(): IAliasProvider | undefined;
	setAliasProvider(aliasProvider: IAliasProvider): unknown;
}
