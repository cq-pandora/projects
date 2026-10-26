import { BasicDataType, TranslationsDataType } from './data-types';

export * from './data-types';

export type DataTypeLocator = (new (lang: string) => BasicDataType) | BasicDataType;

export interface IDataSource {
	get(type: DataTypeLocator): Promise<string>;
}

export type DataTypeKey = 'ACCESSORIES' | 'BERRIES' | 'BOSSES' | 'BREADS' | 'CHAMPIONS' | 'CHAMPION_BOND' | 'GODDESSES'
| 'HEROES' | 'SIGILS' | 'FACTIONS' | 'SP_SKILLS' | 'FISHES' | 'FISHING_GEAR' | 'INTERACTIONS' | 'INHERITANCE'
| 'PORTRAITS' | 'SCARECROWS' | 'HEROES_KEYS_DESCRIPTION' | 'TRANSLATIONS' | 'TRANSLATION_INDICES' | 'TRANSLATIONS_META';

export const DataType: Record<DataTypeKey, DataTypeLocator> = {
	ACCESSORIES: new BasicDataType('accessories'),
	BERRIES: new BasicDataType('berries'),
	BOSSES: new BasicDataType('bosses'),
	BREADS: new BasicDataType('breads'),
	CHAMPIONS: new BasicDataType('champions'),
	CHAMPION_BOND: new BasicDataType('champion_bond'),
	GODDESSES: new BasicDataType('goddesses'),
	HEROES: new BasicDataType('heroes'),
	SIGILS: new BasicDataType('sigils'),
	FACTIONS: new BasicDataType('factions'),
	SP_SKILLS: new BasicDataType('sp_skills'),
	FISHES: new BasicDataType('fishes'),
	FISHING_GEAR: new BasicDataType('fishing_gear'),
	INTERACTIONS: new BasicDataType('interactions'),
	INHERITANCE: new BasicDataType('inheritance'),
	PORTRAITS: new BasicDataType('portraits'),
	SCARECROWS: new BasicDataType('scarecrows'),
	HEROES_KEYS_DESCRIPTION: new BasicDataType('heroes_translations_indices'),
	TRANSLATION_INDICES: new BasicDataType('translations_indices'),
	TRANSLATIONS_META: new TranslationsDataType('meta'),
	TRANSLATIONS: TranslationsDataType,
};
