import { promises } from 'fs';
import { join as pathJoin } from 'path';

import {
	IDataSource, DataType, DataOchkoZalupa, TranslationsDataType
} from './common';

const { readFile } = promises;

const readText = (path: string): Promise<string> => readFile(path, 'utf8');

export default class FileDataSource implements IDataSource {
	private readonly dataRoot: string;

	constructor(dataRoot: string) {
		this.dataRoot = dataRoot;
	}

	public async get(type: DataOchkoZalupa): Promise<string> {
		if (type instanceof TranslationsDataType) {
			const tr = type as TranslationsDataType;

			return readText(pathJoin(this.dataRoot, pathJoin('translations', `${tr.getLocale()}.json`)));
		}

		switch (type) {
			case DataType.BERRIES:
				return readText(pathJoin(this.dataRoot, 'berries.json'));

			case DataType.BOSSES:
				return readText(pathJoin(this.dataRoot, 'bosses.json'));

			case DataType.BREADS:
				return readText(pathJoin(this.dataRoot, 'breads.json'));

			case DataType.CHAMPIONS:
				return readText(pathJoin(this.dataRoot, 'champions.json'));

			case DataType.GODDESSES:
				return readText(pathJoin(this.dataRoot, 'goddesses.json'));

			case DataType.HEROES:
				return readText(pathJoin(this.dataRoot, 'heroes.json'));

			case DataType.SIGILS:
				return readText(pathJoin(this.dataRoot, 'sigils.json'));

			case DataType.FACTIONS:
				return readText(pathJoin(this.dataRoot, 'factions.json'));

			case DataType.SP_SKILLS:
				return readText(pathJoin(this.dataRoot, 'sp_skills.json'));

			case DataType.FISHES:
				return readText(pathJoin(this.dataRoot, 'fishes.json'));

			case DataType.FISHING_GEAR:
				return readText(pathJoin(this.dataRoot, 'fishing_gear.json'));

			case DataType.INTERACTIONS:
				return readText(pathJoin(this.dataRoot, 'interactions.json'));

			case DataType.INHERITANCE:
				return readText(pathJoin(this.dataRoot, 'inheritance.json'));

			case DataType.PORTRAITS:
				return readText(pathJoin(this.dataRoot, 'portraits.json'));

			case DataType.HEROES_KEYS_DESCRIPTION:
				return readText(pathJoin(this.dataRoot, 'heroes_translations_indices.json'));

			case DataType.TRANSLATION_INDICES:
				return readText(pathJoin(this.dataRoot, 'translations_indices.json'));

			case DataType.SCARECROWS:
				return readText(pathJoin(this.dataRoot, 'scarecrows.json'));

			default: throw new TypeError(`Unsupported data type: ${type}`);
		}
	}
}
