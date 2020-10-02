import { DataProvider } from './data-provider';
import { Locale } from './common';

const defaultInstance = new DataProvider();

export const {
	berries, bosses, breads, champions, factions, fishes, fishingGear, goddesses, heroes, interactions, portraits,
	sigils, spSkills, heroKeysDescription, inheritance, locales, localizations, translationIndices, scarecrows,

	init, reinit, setDataSource, getDataSource, setAliasProvider, getAliasProvider, addTranslationIndices
} = defaultInstance;

export function translate(keyRaw?: string, locale: Locale = 'en_us'): string {
	if (typeof keyRaw === 'undefined') return '';

	const key = keyRaw.toUpperCase();

	const translations = localizations[locale];

	if (key in translations) {
		return translations[key].text.replace(/[@#$^]/g, '');
	}

	return key;
}

export * from './data-provider';
export * from './common';
export * from './searchable';
export * from './data-source';
