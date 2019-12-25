import { autoserialize, Deserialize } from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { TranslationKey } from './common-types';

export type TranslationIndexSection =
	'heroes' | 'breads' | 'berries' | 'sigils' | 'goddesses' | 'factions' | 'champions' | 'sp_skills' | 'bosses' |
	'fishes' | 'fishing_gear' | 'fishing_ponds' | 'portraits';

export class TranslationIndex {
	@autoserialize public readonly key: TranslationKey;
	@autoserialize public readonly path: string;
	@autoserialize public readonly text: string;
	@autoserialize public readonly version: string;
	@autoserialize public readonly original: boolean;

	constructor(key: string, path: string, text: string, version: string, original: boolean) {
		this.key = key;
		this.path = path;
		this.text = text;
		this.version = version;
		this.original = original;
	}
}

export type TranslationIndices = {
	[k in TranslationIndexSection]: Array<TranslationIndex>;
};

type TranslationIndicesRaw = {
	[k in TranslationIndexSection]: Array<object>;
};

function parseTranslationIndices(rawJson: string): TranslationIndices {
	const json = JSON.parse(rawJson) as TranslationIndicesRaw;

	return Object.entries(json).reduce<TranslationIndices>((r, [idRaw, raw]) => {
		r[idRaw as TranslationIndexSection] = Deserialize(raw, TranslationIndex) as Array<TranslationIndex>;

		return r;
	}, {} as TranslationIndices);
}

registerDeserializer<TranslationIndices>('TranslationIndices', parseTranslationIndices);
