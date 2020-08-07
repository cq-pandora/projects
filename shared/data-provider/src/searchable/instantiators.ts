import {
	ContextType, GenericConstructor, Deserialize, TranslationIndices, DeserializeSingle
} from '@cquest/entities';

import { IDataSource, DataOchkoZalupa } from '../data-source';

import { contextToSection, Entities, IAliasProvider } from './common';
import { Searchable, ISearchableOptions } from './Searchable';

export function arraySearchable<T extends Entities>(): Searchable<T, T[]> {
	return new Searchable<T, T[]>();
}

export function objectSearchable<T extends Entities>(): Searchable<T, Record<string, T>> {
	return new Searchable<T, Record<string, T>>();
}

export const generateSearchableAliasProvider = (aliasProvider: IAliasProvider, context: ContextType) => (
	(key: string): string => (
		key
			? aliasProvider.get(context, key) || key
			: ''
	)
);

export interface IArraySearchableOptionsGeneratorParams<T extends Entities> {
	dataType: DataOchkoZalupa;
	aliasProvider: IAliasProvider;
	dataSource: IDataSource;
	context: ContextType;
	ctor: GenericConstructor<T> | string;
	translationIndices: TranslationIndices;
}

export async function generateObjectSearchableOptions<T extends Entities>(
	options: IArraySearchableOptionsGeneratorParams<T>
): Promise<ISearchableOptions<T, Record<string, T>>> {
	const {
		dataType, dataSource, context, ctor, aliasProvider, translationIndices
	} = options;

	const section = contextToSection(context);
	const rawData = await dataSource.get(dataType);

	return {
		alias: generateSearchableAliasProvider(aliasProvider, context),
		entities: DeserializeSingle(rawData, ctor),
		index: translationIndices[section],
	};
}

export async function generateArraySearchableOptions<T extends Entities>(
	options: IArraySearchableOptionsGeneratorParams<T>
): Promise<ISearchableOptions<T, T[]>> {
	const {
		dataType, dataSource, context, ctor, aliasProvider, translationIndices
	} = options;

	const section = contextToSection(context);
	const rawData = await dataSource.get(dataType);

	return {
		alias: generateSearchableAliasProvider(aliasProvider, context),
		entities: Deserialize(rawData, ctor),
		index: translationIndices[section],
	};
}
