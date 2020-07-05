import { autoserialize, Deserialize, Serialize } from 'cerialize';

import { registerDeserializer } from '../Deserializer';
import { TranslationKey } from '../common-types';
import { registerSerializer } from '../Serializer';

export type TranslationIndexSection =
	'heroes' | 'breads' | 'berries' | 'sigils' | 'goddesses' | 'factions' | 'champions' | 'sp_skills' | 'bosses' |
	'fishes' | 'fishing_gear' | 'portraits' | 'scarecrows';

export interface ITranslationIndicesOptions {
	key: string;
	path: string;
	text: string;
	version: string;
	original: boolean;
	locale: string;
}

export class TranslationIndex {
	@autoserialize public readonly key!: TranslationKey;
	@autoserialize public readonly path!: string;
	@autoserialize public readonly text!: string;
	@autoserialize public readonly locale!: string;
	@autoserialize public readonly version!: string;
	@autoserialize public readonly original!: boolean;

	constructor(options: ITranslationIndicesOptions) {
		if (!options) return; // only for tests

		this.key = options.key;
		this.path = options.path;
		this.text = options.text;
		this.version = options.version;
		this.original = options.original;
		this.locale = options.locale;
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
