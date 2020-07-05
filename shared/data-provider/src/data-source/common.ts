export interface IDataSource {
	get(type: DataType): Promise<string>;
}

export enum DataType {
	BERRIES = 'berries',
	BOSSES = 'bosses',
	BREADS = 'breads',
	CHAMPIONS = 'champions',
	GODDESSES = 'goddesses',
	HEROES = 'heroes',
	SIGILS = 'sigils',
	FACTIONS = 'factions',
	SP_SKILLS = 'spSkills',
	FISHES = 'fishes',
	FISHING_GEAR = 'fishingGear',
	INTERACTIONS = 'interactions',
	INHERITANCE = 'inheritance',
	PORTRAITS = 'portraits',
	HEROES_KEYS_DESCRIPTION = 'heroesKeysDescription',
	TRANSLATIONS = 'translations',
}
