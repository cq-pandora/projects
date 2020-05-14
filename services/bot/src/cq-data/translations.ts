import {
	DeserializeSingle, TranslationIndices, Translations, TranslationsMeta
} from '@pandora/entities';

import { loadInfo } from './utils';

export type Locale = string;

export const translationIndices = DeserializeSingle<TranslationIndices>(loadInfo('translations_indices'), 'TranslationIndices');

export const translationMeta = DeserializeSingle(loadInfo('translations', 'meta'), TranslationsMeta);

export const localizations = {} as Record<Locale, Translations>;

for (const locale of translationMeta.locales) {
	localizations[locale] = DeserializeSingle<Translations>(loadInfo('translations', locale), 'Translations');
}

export function translate(keyRaw?: string, locale: Locale = 'en_us'): string {
	if (!keyRaw) return '';

	const key = keyRaw.toUpperCase();

	const translations = localizations[locale];

	if (key in translations) {
		return translations[key].text.replace(/[@#$^]/g, '');
	}

	return key;
}
