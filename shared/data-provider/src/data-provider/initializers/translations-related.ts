import {
	DeserializeSingle, TranslationIndices, Translations, TranslationsMeta
} from '@cquest/entities';

import { Locale, Localizations } from '../../common';
import { InitializerFunction } from '../lateinit';
import { IDataProvider } from '../common';
import { DataType } from '../../data-source';

export function generateTranslationIndicesInitializer(
	provider: IDataProvider
): InitializerFunction<TranslationIndices> {
	return async function initialize(instance: TranslationIndices): Promise<void> {
		const dataSource = provider.getDataSource();

		const data = await dataSource!.get(DataType.TRANSLATION_INDICES);

		const newIndices = DeserializeSingle<TranslationIndices>(data, 'TranslationIndices');

		Object.assign(instance, newIndices);
	};
}

export function generateLocalizationsInitializer(provider: IDataProvider): InitializerFunction<Localizations> {
	return async function initialize(instance: Localizations): Promise<void> {
		const dataSource = provider.getDataSource();

		const promises = provider.locales.map(async locale => {
			if (!(DataType.TRANSLATIONS instanceof Function)) {
				throw new Error('Expected DataType.TRANSLATIONS to be constructor');
			}

			const data = await dataSource!.get(new DataType.TRANSLATIONS(locale));

			return {
				locale,
				translation: DeserializeSingle<Translations>(data, 'Translations'),
			};
		});

		const translations = await Promise.all(promises);

		for (const { locale, translation } of translations) {
			instance[locale] = translation;
		}
	};
}

export function generateLocalesInitializer(provider: IDataProvider): InitializerFunction<Locale[]> {
	return async function initialize(instance: Locale[]): Promise<void> {
		const dataSource = provider.getDataSource();

		const data = await dataSource!.get(DataType.TRANSLATIONS_META);

		const meta = DeserializeSingle(data, TranslationsMeta);

		instance.length = 0;

		for (let i = 0; i < meta.locales.length; i++) {
			instance[i] = meta.locales[i];
		}
	};
}
