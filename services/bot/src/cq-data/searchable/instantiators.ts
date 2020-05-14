import { Deserialize, DeserializeSingle, GenericConstructor } from '@pandora/entities';

import { ContextType } from '../../common-types';

import { loadInfo } from '../utils';
import { translationIndices } from '../translations';

import { Entities, contextToSection } from './common';
import { Searchable } from './Searchable';

export function arraySearchable<T extends Entities>(
	cxt: ContextType,
	ctor: GenericConstructor<T>,
	filename?: string
): Searchable<T, T[]> {
	return new Searchable<T, T[]>({
		context: cxt,
		entities: Deserialize(loadInfo(filename || cxt), ctor),
		index: translationIndices[contextToSection(cxt)]
	});
}

export function objectSearchable<T extends Entities>(cxt: ContextType, ctor: string): Searchable<T, Record<string, T>> {
	return new Searchable<T, Record<string, T>>({
		context: cxt,
		entities: DeserializeSingle(loadInfo(cxt), ctor) as Record<string, T>,
		index: translationIndices[contextToSection(cxt)]
	});
}
