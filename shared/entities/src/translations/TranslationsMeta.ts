import { autoserialize, Deserialize, Serialize } from 'cerialize';

import { registerDeserializer } from '../Deserializer';
import { registerSerializer } from '../Serializer';
import { Locale } from '../common-types';

export interface ITranslationsMetaOptions {
	locales: Locale[];
}

export class TranslationsMeta {
	@autoserialize public readonly locales!: Locale[];

	constructor(options: ITranslationsMetaOptions) {
		if (!options) return; // only for tests

		this.locales = options.locales;
	}
}

registerDeserializer(TranslationsMeta, (input: string) => Deserialize(JSON.parse(input), TranslationsMeta));
registerSerializer(TranslationsMeta,
	(input: TranslationsMeta | TranslationsMeta[]) => Serialize(input, TranslationsMeta));
