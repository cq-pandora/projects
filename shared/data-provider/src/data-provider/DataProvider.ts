import {
	Berry, Boss, Bread, Champion, Faction, Fish, FishingGear, Goddess, Hero, Inheritance, Portrait,
	Sigil, SpSkill, TranslationIndices, Scarecrow, Deserialize, Interaction
} from '@cquest/entities';

import {
	arraySearchable, objectSearchable, generateArraySearchableOptions, InteractionsSearchable, HeroKeysDescription,
	IAliasProvider, generateObjectSearchableOptions
} from '../searchable';
import { IDataSource, DataType } from '../data-source';
import { Locale, Localizations } from '../common';

import { lateinit, init, LateInit } from './lateinit';
import {
	generateHeroKeysDescriptionInitializer, generateInheritanceInitializer, generateLocalesInitializer,
	generateLocalizationsInitializer, generateTranslationIndicesInitializer
} from './initializers';
import { IDataProvider } from './common';

export default class DataProvider implements IDataProvider {
	private dataSource?: IDataSource;
	private aliasProvider?: IAliasProvider;

	readonly berries = arraySearchable<Berry>();
	readonly bosses = arraySearchable<Boss>();
	readonly breads = arraySearchable<Bread>();
	readonly champions = arraySearchable<Champion>();
	readonly factions = arraySearchable<Faction>();
	readonly fishes = arraySearchable<Fish>();
	readonly fishingGear = arraySearchable<FishingGear>();
	readonly goddesses = arraySearchable<Goddess>();
	readonly heroes = arraySearchable<Hero>();
	readonly interactions = new InteractionsSearchable();
	readonly portraits = objectSearchable<Portrait>();
	readonly sigils = arraySearchable<Sigil>();
	readonly spSkills = arraySearchable<SpSkill>();
	readonly scarecrows = arraySearchable<Scarecrow>();

	readonly heroKeysDescription: LateInit<HeroKeysDescription> = lateinit<HeroKeysDescription>(
		{},
		generateHeroKeysDescriptionInitializer(this),
	);
	readonly inheritance: LateInit<Inheritance> = lateinit<Inheritance>(
		{} as Inheritance,
		generateInheritanceInitializer(this),
	);
	readonly locales: LateInit<Locale[]> = lateinit(
		[] as Locale[],
		generateLocalesInitializer(this),
	);
	readonly localizations: LateInit<Localizations> = lateinit(
		{} as Localizations,
		generateLocalizationsInitializer(this),
	);
	readonly translationIndices: LateInit<TranslationIndices> = lateinit(
		{} as TranslationIndices,
		generateTranslationIndicesInitializer(this),
	);

	init = async (): Promise<void> => {
		if (this.aliasProvider === undefined) {
			throw new Error('Alias provider was not set!');
		}

		if (this.dataSource === undefined) {
			throw new Error('Data source was not set!');
		}

		await init(this.heroKeysDescription);
		await init(this.inheritance);
		await init(this.locales);
		await init(this.localizations);
		await init(this.translationIndices);

		const genericOptions = {
			aliasProvider: this.aliasProvider,
			dataSource: this.dataSource,
		};

		const interactions = await this.dataSource.get(DataType.INTERACTIONS);

		await this.interactions.init(Deserialize(interactions, Interaction));

		await this.berries.init(generateArraySearchableOptions({
			...genericOptions,
			dataType: DataType.BERRIES,
			context: 'berries',
			ctor: Berry,
			translationIndices: this.translationIndices,
		}));

		await this.bosses.init(generateArraySearchableOptions({
			...genericOptions,
			dataType: DataType.BOSSES,
			context: 'bosses',
			ctor: Boss,
			translationIndices: this.translationIndices,
		}));

		await this.breads.init(generateArraySearchableOptions({
			...genericOptions,
			dataType: DataType.BREADS,
			context: 'breads',
			ctor: Bread,
			translationIndices: this.translationIndices,
		}));

		await this.champions.init(generateArraySearchableOptions({
			...genericOptions,
			dataType: DataType.CHAMPIONS,
			context: 'champions',
			ctor: Champion,
			translationIndices: this.translationIndices,
		}));

		await this.goddesses.init(generateArraySearchableOptions({
			...genericOptions,
			dataType: DataType.GODDESSES,
			context: 'goddesses',
			ctor: Goddess,
			translationIndices: this.translationIndices,
		}));

		await this.heroes.init(generateArraySearchableOptions({
			...genericOptions,
			dataType: DataType.HEROES,
			context: 'heroes',
			ctor: Hero,
			translationIndices: this.translationIndices,
		}));

		await this.sigils.init(generateArraySearchableOptions({
			...genericOptions,
			dataType: DataType.SIGILS,
			context: 'sigils',
			ctor: Sigil,
			translationIndices: this.translationIndices,
		}));

		await this.factions.init(generateArraySearchableOptions({
			...genericOptions,
			dataType: DataType.FACTIONS,
			context: 'factions',
			ctor: Faction,
			translationIndices: this.translationIndices,
		}));

		await this.spSkills.init(generateArraySearchableOptions({
			...genericOptions,
			dataType: DataType.SP_SKILLS,
			context: 'sp',
			ctor: SpSkill,
			translationIndices: this.translationIndices,
		}));

		await this.fishes.init(generateArraySearchableOptions({
			...genericOptions,
			dataType: DataType.FISHES,
			context: 'fishes',
			ctor: Fish,
			translationIndices: this.translationIndices,
		}));

		await this.fishingGear.init(generateArraySearchableOptions({
			...genericOptions,
			dataType: DataType.FISHING_GEAR,
			context: 'fish-gear',
			ctor: FishingGear,
			translationIndices: this.translationIndices,
		}));

		await this.scarecrows.init(generateArraySearchableOptions({
			...genericOptions,
			dataType: DataType.SCARECROWS,
			context: 'scarecrows',
			ctor: Scarecrow,
			translationIndices: this.translationIndices,
		}));

		await this.portraits.init(generateObjectSearchableOptions({
			...genericOptions,
			dataType: DataType.PORTRAITS,
			context: 'portraits',
			ctor: 'Portraits',
			translationIndices: this.translationIndices,
		}));
	};

	reinit = async (): Promise<void> => this.init();

	setDataSource = (dataSource: IDataSource): void => {
		this.dataSource = dataSource;
	};

	getDataSource = (): IDataSource | undefined => this.dataSource;

	getAliasProvider = (): IAliasProvider | undefined => this.aliasProvider;

	setAliasProvider = (aliasProvider: IAliasProvider): void => {
		this.aliasProvider = aliasProvider;
	};
}
