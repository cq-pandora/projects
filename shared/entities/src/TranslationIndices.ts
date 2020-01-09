import { autoserialize, Deserialize, Serialize } from 'cerialize';

import { registerDeserializer } from './Deserializer';
import { TranslationKey } from './common-types';
import { registerSerializer } from './Serializer';

export type TranslationIndexSection =
	'heroes' | 'breads' | 'berries' | 'sigils' | 'goddesses' | 'factions' | 'champions' | 'sp_skills' | 'bosses' |
	'fishes' | 'fishing_gear' | 'portraits';

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

function serializeTranslationIndices(input: TranslationIndices | TranslationIndices[]): object {
	const indices = Array.isArray(input) ? input[0] : input;

	return Object.entries(indices).reduce(
		(res, current) => {
			const [key, index] = current;

			res[key] = Serialize(index, TranslationIndex);

			return res;
		},
		{} as Record<string, object[]>
	);
}

registerDeserializer<TranslationIndices>('TranslationIndices', parseTranslationIndices);
registerSerializer('TranslationIndices', serializeTranslationIndices);
